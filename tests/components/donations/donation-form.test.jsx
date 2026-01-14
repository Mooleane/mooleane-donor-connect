import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { it, expect } from 'vitest'
import DonationForm from '@/components/donations/donation-form'

it('donation form collects amount and donor selection', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DonationForm onSubmit={onSubmit} donors={[]} />)

    await user.type(screen.getByLabelText(/amount/i), '50')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalled()
})
