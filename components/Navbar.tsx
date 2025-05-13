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
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
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

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/createCard" className="text-white hover:text-yellow-300 transition-colors">
            Create Card
          </Link>
          <Link href="/createWallet" className="text-white hover:text-yellow-300 transition-colors">
            Create Wallet
          </Link>
          <div className="relative group">
            <span className="text-white hover:text-yellow-300 transition-colors cursor-pointer">Transactions</span>
            <div className="absolute left-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/simulate-transaction/card" className="block px-4 py-2 text-sm text-white hover:bg-white/10">
                Card Transaction
              </Link>
              <Link
                href="/simulate-transaction/wallet"
                className="block px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Wallet Transaction
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <WalletMultiButton className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md" />
        </div>
      </div>
    </nav>
  )
}