// vitest-environment node

import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

describe('Utility functions', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      const result = cn('foo', { bar: true, baz: false })
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).not.toContain('baz')
    })

    it('should handle tailwind merge conflicts', () => {
      const result = cn('px-2', 'px-4')
      expect(result).toBe('px-4')
    })
  })

  describe('formatCurrency', () => {
    it('should format positive amounts', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500.00')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })
  })

  describe('formatDate', () => {
    it('should format date strings', () => {
      const date = '2024-03-15T10:30:00Z'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/3\/15\/2024/)
    })

    it('should format Date objects', () => {
      const date = new Date('2024-03-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/3\/15\/2024/)
    })

    it('should handle null gracefully', () => {
      const formatted = formatDate(null)
      expect(formatted).toBe('Invalid Date')
    })
  })
})
