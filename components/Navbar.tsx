"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Wallet } from "lucide-react"

interface SimpleWalletButtonProps {
  onConnect: () => void;
  className?: string;
}

// Simple wallet button function that returns JSX directly
function SimpleWalletButton({ onConnect, className = "" }: SimpleWalletButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnecting(false)
      onConnect()
    }, 1500)
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md px-4 py-2 flex items-center ${className}`}
    >
      {isConnecting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </button>
  )
}

interface NavbarProps {
  onConnect: () => void;
  isWalletConnected: boolean;
}

// Navbar component
export default function Navbar({ onConnect, isWalletConnected }: NavbarProps) {
  return (
    <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
        >
          <Wallet className="w-4 h-4 text-black" />
        </motion.div>
        <span className="text-white font-bold text-xl">SolCard</span>
      </div>

      <div className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-white hover:text-yellow-300 transition-colors">
          Home
        </a>
        <a href="#features" className="text-white hover:text-yellow-300 transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="text-white hover:text-yellow-300 transition-colors">
          How It Works
        </a>
        <a href="#about" className="text-white hover:text-yellow-300 transition-colors">
          About Us
        </a>
      </div>

      <div className="flex items-center gap-4">
        <SimpleWalletButton onConnect={onConnect} />
        <button className="text-white border border-white hover:bg-white hover:text-purple-900 rounded-md px-4 py-2">
          Log in
        </button>
      </div>
    </nav>
  )
} 