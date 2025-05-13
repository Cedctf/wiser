"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet, Eye, EyeOff, Copy, Check, CreditCard } from "lucide-react"
import Navbar from "@/components/Navbar"
import { useWallet } from '@solana/wallet-adapter-react';

export default function CreateWallet() {
  const { connected, publicKey } = useWallet();
  const [cardDetails, setCardDetails] = useState({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    ccv: "",
  })

  const [wallet, setWallet] = useState<{
    publicKey: string
    secretKey: string
  } | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted =
        value
          .replace(/\s/g, "")
          .match(/.{1,4}/g)
          ?.join(" ") || value
      setCardDetails({ ...cardDetails, [name]: formatted })
      return
    }

    // Format expiry date with slash
    if (name === "expiryDate") {
      let formatted = value.replace(/\//g, "")
      if (formatted.length > 2) {
        formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}`
      }
      setCardDetails({ ...cardDetails, [name]: formatted })
      return
    }

    setCardDetails({ ...cardDetails, [name]: value })
  }

  const isFormValid = () => {
    return (
      cardDetails.cardHolder.trim() !== "" &&
      cardDetails.cardNumber.replace(/\s/g, "").length === 16 &&
      /^\d{2}\/\d{2}$/.test(cardDetails.expiryDate) &&
      cardDetails.ccv.length === 3
    )
  }

  const generateWallet = async () => {
    if (!isFormValid()) return

    setIsGenerating(true)
    setError('');
    
    try {
      // Connect to the actual API instead of using the timeout
      const response = await fetch('/api/card-to-solana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cardNumber: cardDetails.cardNumber.replace(/\s/g, "") 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process card');
      }
      
      // Map API response to the wallet state format
      setWallet({
        publicKey: data.solana_public_key,
        secretKey: data.solana_secret_key
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-blue-900 overflow-hidden">
      {/* Navigation */}
      <Navbar 
        onConnect={() => {}}
        isWalletConnected={connected}
      />

      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Create Solana Wallet</h1>
        <p className="text-white/80 text-center mt-2 max-w-2xl mx-auto">
          Enter your card details to generate a Solana wallet linked to your debit card.
        </p>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 md:p-12">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-4 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {!wallet ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="cardHolder" className="block text-white mb-1">
                        Card Holder Name
                      </label>
                      <input
                        id="cardHolder"
                        name="cardHolder"
                        placeholder="JOHN DOE"
                        value={cardDetails.cardHolder}
                        onChange={handleInputChange}
                        className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="cardNumber" className="block text-white mb-1">
                        Card Number
                      </label>
                      <input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="4689 1234 5678 9012"
                        value={cardDetails.cardNumber}
                        onChange={handleInputChange}
                        maxLength={19}
                        className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-white mb-1">
                          Expiry Date
                        </label>
                        <input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={handleInputChange}
                          maxLength={5}
                          className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                        />
                      </div>

                      <div>
                        <label htmlFor="ccv" className="block text-white mb-1">
                          CCV
                        </label>
                        <input
                          id="ccv"
                          name="ccv"
                          placeholder="123"
                          value={cardDetails.ccv}
                          onChange={handleInputChange}
                          maxLength={3}
                          className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full max-w-md h-[220px]"
                    style={{ perspective: "1000px" }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 flex flex-col justify-between"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: "rotateY(-5deg) rotateX(5deg)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <div className="text-yellow-400 font-bold text-lg">WISER</div>
                          <div className="text-white/60 text-xs">PREMIUM</div>
                        </div>
                        <div className="w-12 h-10 rounded-md flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>

                      {/* EMV Chip */}
                      <div className="w-12 h-10 mt-2">
                        <div className="w-12 h-9 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-md flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className="bg-yellow-500/30 w-full h-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-white font-mono text-lg tracking-widest mb-2">
                          {cardDetails.cardNumber || "4689 1234 5678 9012"}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white/60 text-xs mb-1">CARD HOLDER</div>
                            <div className="text-white text-sm">{cardDetails.cardHolder || "CARD HOLDER"}</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs mb-1">EXPIRES</div>
                            <div className="text-white text-sm">{cardDetails.expiryDate || "MM/YY"}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-yellow-400 font-bold">SOL</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  onClick={generateWallet}
                  disabled={!isFormValid() || isGenerating}
                  className={`bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-8 py-6 rounded-xl text-lg flex items-center ${
                    !isFormValid() || isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="mr-2"
                      >
                        <Wallet className="w-5 h-5" />
                      </motion.div>
                      Generating Wallet...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Generate Wallet
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="w-20 h-20 bg-indigo-800 rounded-full flex items-center justify-center"
                >
                  <Wallet className="w-10 h-10 text-white" />
                </motion.div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Wallet Generated Successfully!</h2>
                <p className="text-white/70 max-w-md mx-auto">
                  Your Solana wallet has been created. Keep your secret key safe and never share it with anyone.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white font-medium">Public Key</label>
                    <button
                      onClick={() => copyToClipboard(wallet.publicKey, "public")}
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-white/5 p-1 rounded"
                    >
                      {copied === "public" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-white/90 font-mono text-sm break-all">
                    {wallet.publicKey}
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white font-medium">Secret Key</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-white/5 p-1 rounded"
                      >
                        {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(wallet.secretKey, "secret")}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-white/5 p-1 rounded"
                      >
                        {copied === "secret" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-white/90 font-mono text-sm break-all">
                    {showSecretKey ? wallet.secretKey : "•".repeat(64)}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-400/10 border border-indigo-400/30 rounded-lg p-4 text-indigo-300 text-sm">
                <p className="font-medium">Important Security Notice:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Never share your secret key with anyone.</li>
                  <li>Store your secret key in a secure location.</li>
                  <li>Wiser never stores your keys on our servers.</li>
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    setWallet(null)
                    setCardDetails({
                      cardHolder: "",
                      cardNumber: "",
                      expiryDate: "",
                      ccv: "",
                    })
                  }}
                  className="bg-indigo-800 hover:bg-indigo-900 text-white font-medium px-6 py-3 rounded-xl"
                >
                  Create Another Wallet
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}