import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { it, expect } from 'vitest'
import DonorForm from '@/components/donors/donor-form'

it('donor form updates fields and submits', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()
    render(<DonorForm onSubmit={handle} />)

    await user.type(screen.getByLabelText(/first name/i), 'Donor')
    await user.type(screen.getByLabelText(/last name/i), 'Person')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(handle).toHaveBeenCalled()
})
