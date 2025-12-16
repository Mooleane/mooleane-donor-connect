// vitest-environment jsdom

/**
 * Component Tests: DonorStatusBadge
 * Tests donor status badge rendering with different statuses
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DonorStatusBadge } from '@/components/donors/donor-status-badge'

describe('DonorStatusBadge Component', () => {
  it('should render ACTIVE status with success styling', () => {
    render(<DonorStatusBadge status="ACTIVE" />)

    const badge = screen.getByText('Active')
    expect(badge).toBeInTheDocument()

    // Should have success/green styling
    expect(badge.className).toMatch(/green|success/i)
  })

  it('should render LAPSED status with warning styling', () => {
    render(<DonorStatusBadge status="LAPSED" />)

    const badge = screen.getByText('Lapsed')
    expect(badge).toBeInTheDocument()

    // Should have warning/yellow styling
    expect(badge.className).toMatch(/yellow|warning/i)
  })

  it('should render INACTIVE status with neutral styling', () => {
    render(<DonorStatusBadge status="INACTIVE" />)

    const badge = screen.getByText('Inactive')
    expect(badge).toBeInTheDocument()

    // Should have neutral/gray styling
    expect(badge.className).toMatch(/gray|neutral/i)
  })

  it('should render DO_NOT_CONTACT status with critical styling', () => {
    render(<DonorStatusBadge status="DO_NOT_CONTACT" />)

    const badge = screen.getByText('Do Not Contact')
    expect(badge).toBeInTheDocument()

    // Should have critical/red styling
    expect(badge.className).toMatch(/red|destructive|critical/i)
  })

  it('should handle unknown status gracefully', () => {
    render(<DonorStatusBadge status="UNKNOWN" />)

    // Should either show "Unknown" or default to a safe fallback
    const badge = screen.getByText(/unknown|active/i)
    expect(badge).toBeInTheDocument()
  })

  it('should apply custom className if provided', () => {
    render(<DonorStatusBadge status="ACTIVE" className="custom-class" />)

    const badge = screen.getByText('Active')
    expect(badge.className).toContain('custom-class')
  })

  it('should be accessible with proper text content', () => {
    render(<DonorStatusBadge status="ACTIVE" />)

    // Badge should have readable text for screen readers
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  describe('All Status Values', () => {
    const statuses = [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'LAPSED', label: 'Lapsed' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'DO_NOT_CONTACT', label: 'Do Not Contact' },
    ]

    statuses.forEach(({ value, label }) => {
      it(`should correctly render ${value} status`, () => {
        render(<DonorStatusBadge status={value} />)
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })
})
