'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  // TODO: Implement state for email, password, error, loading
  
  // TODO: Implement handleSubmit function
  // - Prevent default form submission
  // - Make API call to /api/auth/login
  // - Handle success: redirect to dashboard or intended destination
  // - Handle errors: display error message

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <p></p>
        <CardDescription>
          Your job is to redesign this page to use the proper login page!
          Use the BUILDD Framework or Mental models to help you design this page. 
          You role and goal is to pass all test for the api endpoints. 
        <div></div>
          <p>Once you've successfully seeded the database, you should be able to login using the below credential. </p> 
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: Add error display */}
        
        <form>
          {/* TODO: Add email input field */}
          {/* TODO: Add password input field */}
          {/* TODO: Add submit button with loading state */}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Demo credentials: admin@hopefoundation.org / password123
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}