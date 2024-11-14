"use client"
import Link from 'next/link'
import { useState, FC } from 'react'

const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          MyShop
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/cart" className="px-4 py-2 text-gray-700 hover:text-gray-900">
            Cart
          </Link>
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Sign Up
          </Link>
        </div>
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden flex flex-col space-y-2 p-4">
          <Link href="/cart" className="px-4 py-2 text-gray-700 hover:text-gray-900">
            Cart
          </Link>
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar
