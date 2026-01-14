import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { jsonError } from '@/lib/api/route-response'
import { Redis } from '@upstash/redis'

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

export async function GET(request) {
    try {
        const sessionToken = request.cookies.get('session')?.value
        const session = await getSession(sessionToken)
        if (!session) return jsonError('Unauthorized', 401)

        const orgId = session.user.organizationId

        // Rate limiting: only consume a regeneration when caller provides `?regen=1`.
        try {
            const url = new URL(request.url)
            const regenParam = url.searchParams.get('regen')
            const shouldCount = regenParam && ['1', 'true'].includes(regenParam.toLowerCase())

            if (shouldCount) {
                if (redis) {
                    const now = new Date()
                    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
                    const key = `insights:${session.user.id}:${monthKey}`
                    const count = await redis.incr(key)
                    if (count === 1) {
                        // set TTL to end of month
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
                        const ttl = Math.ceil((endOfMonth.getTime() - now.getTime()) / 1000)
                        await redis.expire(key, ttl)
                    }
                    if (count > 50) {
                        return NextResponse.json({ error: 'Rate limit exceeded. You may regenerate up to 50 times per month.' }, { status: 429 })
                    }
                } else {
                    console.warn('Upstash Redis not configured: skipping insights rate limiting')
                }
            }
        } catch (err) {
            console.error('Insights rate limiting failed, allowing request', err)
        }

        // Determine requested scope: 'month' (default) or 'lifetime'
        const url = new URL(request.url)
        const scopeParam = (url.searchParams.get('scope') || 'month').toLowerCase()

        // Get current month's date range
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        // Fetch donations according to scope
        const donations = await prisma.donation.findMany({
            where: scopeParam === 'lifetime' ? {
                donor: { organizationId: orgId }
            } : {
                donor: { organizationId: orgId },
                date: { gte: startOfMonth, lt: endOfMonth }
            },
            orderBy: { date: 'desc' },
            include: {
                donor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        retentionRisk: true,
                        totalGifts: true,
                        totalAmount: true
                    }
                },
                campaign: {
                    select: { name: true }
                }
            }
        })

        // If no donations in scope, return a helpful default message
        if (donations.length === 0) {
            return NextResponse.json({
                insights: scopeParam === 'lifetime' ? [
                    'No donations recorded yet for this organization.',
                    'Get started by recording donations or importing past data.'
                ] : [
                    'No donations recorded this month yet.',
                    'Consider reaching out to lapsed donors.',
                    'Start a new campaign to boost engagement.'
                ]
            })
        }

        // Prepare donation data for the prompt
        const donationSummary = donations.map(d => ({
            date: d.date.toISOString().split('T')[0],
            dayOfWeek: new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' }),
            amount: d.amount,
            type: d.type,
            method: d.method,
            notes: d.notes,
            donorName: d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Unknown',
            donorRisk: d.donor?.retentionRisk || 'UNKNOWN',
            donorTotalGifts: d.donor?.totalGifts || 0,
            campaign: d.campaign?.name || null
        }))

        // Calculate some statistics
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
        const avgAmount = totalAmount / donations.length
        const donationsByDay = {}
        donations.forEach(d => {
            const day = d.date.getDate()
            donationsByDay[day] = (donationsByDay[day] || 0) + 1
        })
        const mostActiveDays = Object.entries(donationsByDay)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([day, count]) => `Day ${day} (${count} donations)`)

        const donationsByDayOfWeek = {}
        donations.forEach(d => {
            const dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' })
            donationsByDayOfWeek[dayName] = (donationsByDayOfWeek[dayName] || 0) + 1
        })

        // Extract notes for context
        const notesWithContext = donations
            .filter(d => d.notes && d.notes.trim())
            .map(d => `- ${d.donor?.firstName || 'Unknown'}: "${d.notes}"`)
            .slice(0, 10) // Limit to 10 notes

        // Build the prompt
        const prompt = `You are an AI assistant for a nonprofit donor management platform called DonorConnect. Analyze the following donation data (${scopeParam === 'lifetime' ? 'lifetime' : 'this month'}) and provide 3-5 concise, actionable insights for the fundraising team.

    DONATION DATA SCOPE: ${scopeParam === 'lifetime' ? 'Lifetime (all records)' : 'Current Month'}
    - Total donations: ${donationSummary.length}
    - Total raised: $${totalAmount.toFixed(2)}
    - Average donation: $${avgAmount.toFixed(2)}
    - Most active days: ${mostActiveDays.join(', ') || 'N/A'}
    - Donations by day of week: ${JSON.stringify(donationsByDayOfWeek)}

    DONATION DETAILS (sample):
    ${JSON.stringify(donationSummary.slice(0, 20), null, 2)}

    ${notesWithContext.length > 0 ? `DONATION NOTES:\n${notesWithContext.join('\n')}` : ''}

    Based on this data, provide 3-5 brief insights as bullet points. Focus on:
    - Patterns in donation timing (days, weekdays vs weekends)
    - Notable donations or donor behaviors
    - Insights from the donation notes if relevant
    - Actionable recommendations for donor retention
    - Any concerning trends or opportunities

    Keep each insight to 1-2 sentences. Be specific and reference the actual data when possible.`

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful nonprofit fundraising analyst. Provide concise, actionable insights based on donation data. Format your response as a simple list of insights, one per line, starting with a dash (-).'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        })

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json().catch(() => ({}))
            console.error('OpenAI API error:', errorData)
            return NextResponse.json({
                insights: [
                    'Unable to generate AI insights at this time.',
                    `You have ${donations.length} donations totaling $${totalAmount.toFixed(2)} ${scopeParam === 'lifetime' ? 'lifetime' : 'this month'}.`,
                    'Check back later for AI-powered analysis.'
                ]
            })
        }

        const openaiData = await openaiResponse.json()
        const aiResponse = openaiData.choices?.[0]?.message?.content || ''

        // Parse the response into individual insights
        const insights = aiResponse
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
            .map(line => line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
            .filter(line => line.length > 0)
            .slice(0, 5)

        // Fallback if parsing failed
        if (insights.length === 0) {
            return NextResponse.json({
                insights: [aiResponse.substring(0, 200) || 'AI analysis completed but no specific insights extracted.']
            })
        }

        return NextResponse.json({ insights })

    } catch (error) {
        console.error('GET /api/dashboard/insights', error)
        return jsonError('Internal server error', 500)
    }
}
