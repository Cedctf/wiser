"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wallet, Copy, Check, RefreshCw, ArrowRight } from "lucide-react"
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from "@/components/Navbar"
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton with SSR disabled
const DynamicWalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [walletAddress, setWalletAddress] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [cardDetails, setCardDetails] = useState<{
    number: string
    expiry: string
    ccv: string
    name: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  
  // Form data for card creation
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
    }
  }, [connected, publicKey]);

  const generateCardDetails = async () => {
    // Validate form fields
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError("Please fill in all fields");
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setFormError("Please enter a valid email address");
      return;
    }
    
    setFormError("");
    setIsGenerating(true);

    try {
      // Call the API route to create the card
      const response = await fetch('/api/createCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          walletAddress
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create card');
      }

      // Format card number with spaces for display
      let formattedCardNumber = "....";
      if (data.card && data.card.pan) {
        formattedCardNumber = data.card.pan.match(/.{1,4}/g)?.join(" ") || data.card.pan;
      }

      // Get expiry date from the response
      let expiry = "MM/YY";
      if (data.card && data.card.expiration) {
        // Format the expiration as MM/YY
        expiry = `${data.card.expiration.substring(0, 2)}/${data.card.expiration.substring(2)}`;
      }

      // Always set CVV to "999" regardless of API response
      const ccv = "999";

      // Create card details object with data from API
      setCardDetails({
        number: formattedCardNumber,
        expiry,
        ccv,
        name: `${firstName.toUpperCase()} ${lastName.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error creating card:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create card');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Create Your Wiser Card</h1>
        <p className="text-white/80 text-center mt-2 max-w-2xl mx-auto">
          Connect your Solana wallet to generate a virtual debit card that you can use anywhere.
        </p>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 md:p-12">
          {!connected ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Wallet className="w-16 h-16 text-indigo-400 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-6">Connect Your Wallet</h2>
              <p className="text-white/70 text-center mb-8 max-w-md">
                Connect your Solana wallet to generate a virtual debit card linked to your wallet address.
              </p>
              <DynamicWalletMultiButton className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md px-8 py-4 text-lg" />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white/5 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Wallet Connected</h3>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    Connected
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-white/70 truncate flex-1">{walletAddress}</div>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!cardDetails ? (
                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Enter Your Details</h3>
                    
                    {formError && (
                      <div className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4">
                        {formError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="text-white block mb-1">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-white/10 text-white border border-white/20 p-2 rounded-md w-full"
                          placeholder="John"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="text-white block mb-1">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white/10 text-white border border-white/20 p-2 rounded-md w-full"
                          placeholder="Doe"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="email" className="text-white block mb-1">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white/10 text-white border border-white/20 p-2 rounded-md w-full"
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={generateCardDetails}
                      disabled={isGenerating}
                      className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-8 py-6 rounded-xl text-lg flex items-center"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Generating Card...
                        </>
                      ) : (
                        "Generate Debit Card"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full max-w-md mx-auto h-[220px]"
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
                          <div className="text-indigo-400 font-bold text-lg">WISER</div>
                          <div className="text-white/60 text-xs">PREMIUM</div>
                        </div>
                        <div className="w-12 h-10 rounded-md flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-indigo-400" />
                        </div>
                      </div>

                      {/* EMV Chip */}
                      <div className="w-12 h-10 mt-2">
                        <div className="w-12 h-9 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-md flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className="bg-indigo-600/30 w-full h-full"></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-white font-mono text-lg tracking-widest mb-2">{cardDetails.number}</div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white/60 text-xs mb-1">CARD HOLDER</div>
                            <div className="text-white text-sm">{cardDetails.name}</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs mb-1">EXPIRES</div>
                            <div className="text-white text-sm">{cardDetails.expiry}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-indigo-400 font-bold">SOL</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="cardNumber" className="text-white block mb-1">
                          Card Number
                        </label>
                        <div className="flex mt-1">
                          <input
                            id="cardNumber"
                            value={cardDetails.number}
                            readOnly
                            className="bg-white/10 text-white border border-white/20 p-2 rounded-md w-full"
                          />
                          <button
                            onClick={() => copyToClipboard(cardDetails.number.replace(/\s/g, ""))}
                            className="ml-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-md"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="cardHolder" className="text-white block mb-1">
                          Card Holder
                        </label>
                        <input
                          id="cardHolder"
                          value={cardDetails.name}
                          readOnly
                          className="mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="expiry" className="text-white block mb-1">
                          Expiry Date
                        </label>
                        <input
                          id="expiry"
                          value={cardDetails.expiry}
                          readOnly
                          className="mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="ccv" className="text-white block mb-1">
                          CCV
                        </label>
                        <input
                          id="ccv"
                          value={cardDetails.ccv}
                          readOnly
                          className="mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={generateCardDetails}
                      className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-6 py-3 rounded-xl flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}