"use client"

import { motion } from "framer-motion"
import { Wallet } from "lucide-react"
import dynamic from 'next/dynamic';
import '@solana/wallet-adapter-react-ui/styles.css'; // Import the styles

// Dynamically import WalletMultiButton with SSR disabled
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

interface NavbarProps {
  onConnect: () => void;
  isWalletConnected: boolean;
}

// Navbar component
export default function Navbar({ onConnect, isWalletConnected }: NavbarProps) {
  return (
    <nav className="w-full bg-transparent backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
          >
            <Wallet className="w-4 h-4 text-black" />
          </motion.div>
          <span className="text-white font-bold text-xl">Wiser</span>
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

        <div className="flex items-center">
          <WalletMultiButton className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md" />
        </div>
      </div>
    </nav>
  )
}