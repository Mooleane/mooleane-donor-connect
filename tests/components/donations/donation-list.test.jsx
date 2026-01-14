import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { it, expect } from 'vitest'
import DonationList from '@/components/donations/donation-list'

it('donation list renders items', () => {
    const items = [{ id: '1', amount: 10 }, { id: '2', amount: 20 }]
    render(<DonationList donations={items} />)

    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/20/)).toBeInTheDocument()
})
