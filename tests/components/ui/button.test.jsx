import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

it('ui Button calls onClick and renders label', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()
    render(<Button onClick={handle}>Submit</Button>)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(handle).toHaveBeenCalled()
})
