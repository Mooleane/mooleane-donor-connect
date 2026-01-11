import { prisma } from '@/lib/db'

/**
 * Recalculate donor totals (totalGifts, totalAmount, firstGiftDate, lastGiftDate)
 * based on their actual donations in the database
 */
export async function recalculateDonorTotals(donorId) {
    const donations = await prisma.donation.findMany({
        where: { donorId },
        orderBy: { date: 'asc' },
        select: { amount: true, date: true }
    })

    const totalGifts = donations.length
    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const firstGiftDate = donations.length > 0 ? donations[0].date : null
    const lastGiftDate = donations.length > 0 ? donations[donations.length - 1].date : null

    const updated = await prisma.donor.update({
        where: { id: donorId },
        data: {
            totalGifts,
            totalAmount,
            firstGiftDate,
            lastGiftDate
        }
    })

    return updated
}
