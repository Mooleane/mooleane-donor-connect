// Auth layout for login and register pages
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* TODO: Add app branding/logo */}
          {children}
        </div>
      </div>
    </div>
  )
}