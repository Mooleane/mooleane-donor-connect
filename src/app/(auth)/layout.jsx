// Auth layout for login and register pages
export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
      <div className="mx-auto w-full max-w-6xl">
        {/* TODO: Add app branding/logo */}
        {children}
      </div>
    </main>
  )
}