import { NextResponse } from 'next/server'

/**
 * Standard JSON error response for API routes.
 *
 * Shape: { error: string, ...(details && { details }) }
 */
export function jsonError(message, status = 500, details) {
    const body = { error: message }
    if (details !== undefined) body.details = details
    return NextResponse.json(body, { status })
}
