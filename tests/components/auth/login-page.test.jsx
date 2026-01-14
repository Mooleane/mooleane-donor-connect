import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { it, expect } from 'vitest'
import LoginPage from '@/components/auth/login-page'

it('login page submits email and password', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()
    render(<LoginPage onSubmit={handle} />)

    await user.type(screen.getByLabelText(/email/i), 'admin@hopefoundation.org')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(handle).toHaveBeenCalled()
})
