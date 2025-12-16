'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  // TODO: Implement state for form fields and validation

  // TODO: Implement handleSubmit function  
  // - Make API call to /api/auth/register
  // - Handle success and errors
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Register for a new account. 
          You must create this page as well! 
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: Add error display */}
        
        <form>
          {/* TODO: Add form fields - firstName, lastName, email, password */}
          {/* TODO: Add organization selection */}
          {/* TODO: Add submit button */}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}