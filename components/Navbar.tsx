"use client"

import { motion } from "framer-motion"
import { Wallet } from "lucide-react"
import dynamic from 'next/dynamic';
import '@solana/wallet-adapter-react-ui/styles.css'; // Import the styles
import Link from 'next/link';

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
      <div className="container mx-auto px-4 py-6 flex items-center">
        {/* Logo area - takes up 1/3 of space */}
        <div className="flex-1">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
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
          </Link>
        </div>

        {/* Navigation links - centered and taking up 1/3 of space */}
        <div className="flex-1 hidden md:flex items-center justify-center">
          <div className="flex space-x-8">
            <Link href="/createCard" className="text-white hover:text-indigo-400 transition-colors">
              Generate Card
            </Link>
            <Link href="/createWallet" className="text-white hover:text-indigo-400 transition-colors">
              Generate Wallet
            </Link>
            <Link href="/transaction/card" className="text-white hover:text-indigo-400 transition-colors">
              Transactions
            </Link>
          </div>
        </div>

        {/* Wallet button area - takes up 1/3 of space */}
        <div className="flex-1 flex justify-end">
          <WalletMultiButton className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md" />
        </div>
      </div>
    </nav>
  )
}