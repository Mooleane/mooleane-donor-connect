// Session management for authentication
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { prisma } from './db'

/**
 * Create a new session for a user
 * @param {string} userId - User ID to create session for
 * @returns {Promise<string>} Session token
 */
export async function createSession(userId) {
  const token = crypto.randomBytes(48).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days

  await prisma.session.create({ data: { token, userId, expiresAt } })
  return token
}

/**
 * Get session and user data from session token
 * @param {string} sessionToken - Session token to validate
 * @returns {Promise<Object|null>} Session with user data or null
 */
export async function getSession(sessionToken) {
  if (!sessionToken) return null
  const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } })
  if (!session) return null
  if (session.expiresAt && session.expiresAt < new Date()) {
    // expired
    await prisma.session.delete({ where: { token: sessionToken } }).catch(() => { })
    return null
  }
  const { user, ...rest } = session
  const { password: _p, ...safeUser } = user || {}
  return { ...rest, user: safeUser }
}

/**
 * Get current user from session (for server components)
 * @returns {Promise<Object|null>} User object or null
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const session = await getSession(token)
    return session ? session.user : null
  } catch (error) {
    console.error('Failed to get session user:', error)
    return null
  }
}

/**
 * Delete a session (logout)
 * @param {string} sessionToken - Session token to delete
 */
export async function deleteSession(sessionToken) {
  if (!sessionToken) return
  await prisma.session.delete({ where: { token: sessionToken } }).catch(() => { })
} 
