import Link from 'next/link'

const navigation = [
  { name: 'Home', href: '/home' },
  { name: 'About', href: '/about' },
  { name: 'Why DonorConnect?', href: '/why-donor-connect' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Settings', href: '/settings' },
  { name: "Rubric Evidence", href: "/rubric-evidence" },
  { name: 'Reflection', href: '/reflection' },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-xl font-bold">Donor Connect</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}

