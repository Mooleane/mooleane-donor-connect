// Authentication utilities
import { prisma } from './db'
import { hashPassword, verifyPassword } from './password'

/**
 * Register a new user. If no organizationId is provided, create a new organization.
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user object (password omitted)
 */
export async function register(userData) {
  const { firstName, lastName, email: rawEmail, password, organizationId } = userData || {}

  if (!firstName || !lastName || !rawEmail || !password) {
    const err = new Error('Missing required fields')
    err.code = 'VALIDATION_ERROR'
    throw err
  }

  const email = rawEmail.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Email already exists')
    err.code = 'DUPLICATE_EMAIL'
    throw err
  }

  const hashed = await hashPassword(password)

  if (!organizationId) {
    const err = new Error('organizationId is required')
    err.code = 'VALIDATION_ERROR'
    throw err
  }

  const orgId = organizationId

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      organizationId: orgId,
      role: 'ADMIN'
    }
  })

  // Remove password before returning
  const { password: _p, ...safe } = user
  return safe
}

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object or null if invalid
 */
export async function login(email, password) {
  if (!email || !password) return null
  const normalized = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalized } })
  if (!user) return null
  const ok = await verifyPassword(password, user.password)
  if (!ok) return null
  const { password: _p, ...safe } = user
  return safe
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserById(userId) {
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null
  const { password: _p, ...safe } = user
  return safe
} 