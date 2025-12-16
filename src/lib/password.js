// Password hashing utilities using bcrypt
import bcrypt from 'bcryptjs'

/**
 * TODO: Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  // TODO: Use bcrypt to hash password with salt rounds
  // TODO: Return hashed password
}

/**
 * TODO: Verify a password against its hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hashedPassword) {
  // TODO: Use bcrypt to compare password with hash
  // TODO: Return boolean result
}