"use client"

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ClientRootWrapper({ children }) {
    const pathname = usePathname()

    useEffect(() => {
        function enforce() {
            try {
                document.body.classList.add('overflow-hidden')
                const main = document.querySelector('main')
                if (main) {
                    main.style.overflowY = 'auto'
                    main.scrollTop = 0
                }
            } catch (e) {
            }
        }

        enforce()

        const onClick = () => setTimeout(enforce, 0)
        document.addEventListener('click', onClick, true)

        return () => document.removeEventListener('click', onClick, true)
    }, [pathname])

    return children
}
