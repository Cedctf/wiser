"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Navbar from "@/components/Navbar"
import CardDisplay from "@/components/CardDisplay"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-blue-900 overflow-hidden">
      {/* Navigation */}
      <Navbar 
        onConnect={() => setIsWalletConnected(true)}
        isWalletConnected={isWalletConnected}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mb-12 md:mb-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              <span className="relative inline-block">
                Crypto Banking
              </span>
              <br />
              You Want To Use.
            </h1>
          </motion.div>

          <motion.p
            className="text-white/80 text-lg mt-6 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Connect your Solana wallet and get instant access to a virtual debit card. Spend your crypto or cash anywhere,
            anytime with low conversion fees.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <a href="/createCard" className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-8 py-6 rounded-xl text-lg flex items-center">
              Generate Card <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a href="/createWallet" className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-8 py-6 rounded-xl text-lg flex items-center">
              Generate Wallet <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </motion.div>

        {/* Card Display Component */}
        <CardDisplay />
      </section>
    </div>
  )
}