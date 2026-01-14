import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { it, expect } from 'vitest'
import { Badge } from '@/components/ui/badge'

it('ui Badge renders children and accepts className', () => {
    render(<Badge className="test-class">New</Badge>)
    const el = screen.getByText(/New/i)
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('test-class')
})
