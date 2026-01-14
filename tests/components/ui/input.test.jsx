import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { it, expect } from 'vitest'
import { Input } from '@/components/ui/input'

it('ui Input accepts typed text and forwards props', async () => {
    const user = userEvent.setup()
    render(<Input aria-label="name" />)
    await user.type(screen.getByLabelText(/name/i), 'Alice')
    expect(screen.getByLabelText(/name/i)).toHaveValue('Alice')
})
