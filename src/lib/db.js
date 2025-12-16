// Prisma Client Singleton
// Ensures single instance in development (prevents hot reload issues)

import prisma from '../../prisma/client.js'

export { prisma }
export default prisma
