"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, ArrowRight, Check, RefreshCw, DollarSign, CreditCard as CardIcon } from "lucide-react"
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from "@/components/Navbar"

interface TransactionResponse {
  success: boolean;
  transaction: {
    token: string;
    amount: string;
    status: string;
    response: any;
  };
  error?: string;
}

export default function SimulateTransactionCard() {
  const { connected, publicKey } = useWallet();
  const [cardDetails, setCardDetails] = useState({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    ccv: "",
  })

  const [transactionDetails, setTransactionDetails] = useState({
    amount: "",
    merchant: "Solana Merchant",
    currency: "USD",
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean
    id: string
    timestamp: string
    amount: string
    fee: string
    merchant: string
  } | null>(null)

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleTransactionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTransactionDetails({ ...transactionDetails, [name]: value })
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTransactionDetails({ ...transactionDetails, currency: e.target.value })
  }

  const isFormValid = () => {
    return (
      connected &&
      publicKey &&
      cardDetails.cardHolder.trim() !== "" &&
      cardDetails.cardNumber.replace(/\s/g, "").length === 16 &&
      /^\d{2}\/\d{2}$/.test(cardDetails.expiryDate) &&
      cardDetails.ccv.length === 3 &&
      transactionDetails.amount.trim() !== "" &&
      !isNaN(Number.parseFloat(transactionDetails.amount)) &&
      Number.parseFloat(transactionDetails.amount) > 0
    )
  }

  const processTransaction = async () => {
    if (!isFormValid()) return
    
    setIsProcessing(true)
    setError(null);

    try {
      // Important: We use the wallet address (first 36 chars) as the card token
      // not the fake card number entered by the user
      const walletCardToken = publicKey?.toString().substring(0, 36);
      
      const response = await fetch('/api/transact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(transactionDetails.amount),
          cardToken: walletCardToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to simulate transaction');
      }

      setTransaction(data);
      
      // Create a result object for the UI from the API response
      const fee = (Number(data.transaction.amount) * 0.01).toFixed(2); // 1% fee
      
      setTransactionResult({
        success: data.success,
        id: data.transaction.token || `TX${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        amount: data.transaction.amount,
        fee: fee,
        merchant: transactionDetails.merchant,
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }

  const resetTransaction = () => {
    setTransactionResult(null)
    setTransaction(null)
    // Reset card details too
    setCardDetails({
      cardHolder: "",
      cardNumber: "",
      expiryDate: "",
      ccv: "",
    })
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
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Simulate Card Transaction</h1>
        <p className="text-white/80 text-center mt-2 max-w-2xl mx-auto">
          Connect your wallet and enter card details to simulate a payment.
        </p>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 md:p-12">
          {!connected ? (
            <div className="text-center p-6">
              <CreditCard className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-white/70 mb-6">
                Please connect your Solana wallet to simulate a card transaction
              </p>
            </div>
          ) : !transactionResult ? (
            <div className="space-y-8">
              {error && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-4 rounded-lg">
                  <p>{error}</p>
                </div>
              )}
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <CardIcon className="w-5 h-5 mr-2 text-indigo-400" />
                    Card Details
                  </h2>
                  
                  <div>
                    <label htmlFor="cardHolder" className="block text-white mb-1">
                      Card Holder Name
                    </label>
                    <input
                      id="cardHolder"
                      name="cardHolder"
                      placeholder="JOHN DOE"
                      value={cardDetails.cardHolder}
                      onChange={handleCardInputChange}
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
                      onChange={handleCardInputChange}
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
                        onChange={handleCardInputChange}
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
                        onChange={handleCardInputChange}
                        maxLength={3}
                        className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-indigo-400" />
                    Transaction Details
                  </h2>

                  <div>
                    <label htmlFor="merchant" className="block text-white mb-1">
                      Merchant Name
                    </label>
                    <input
                      id="merchant"
                      name="merchant"
                      placeholder="Coffee Shop"
                      value={transactionDetails.merchant}
                      onChange={handleTransactionInputChange}
                      className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="amount" className="block text-white mb-1">
                        Amount
                      </label>
                      <input
                        id="amount"
                        name="amount"
                        placeholder="25.00"
                        value={transactionDetails.amount}
                        onChange={handleTransactionInputChange}
                        className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-white mb-1">
                        Currency
                      </label>
                      <select
                        id="currency"
                        value={transactionDetails.currency}
                        onChange={handleCurrencyChange}
                        className="w-full mt-1 bg-white/10 text-white border border-white/20 p-2 rounded-md"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg mt-4">
                    <p className="text-white/70 text-sm">
                      This is a simulation. No actual transaction will be processed and no funds will be moved. Your wallet address is used as the token.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  onClick={processTransaction}
                  disabled={!isFormValid() || isProcessing}
                  className={`bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-8 py-6 rounded-xl text-lg flex items-center ${
                    !isFormValid() || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing Transaction...
                    </>
                  ) : (
                    <>
                      Process Transaction
                      <ArrowRight className="ml-2 w-5 h-5" />
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
                  className={`w-20 h-20 ${transactionResult.success ? "bg-green-500" : "bg-red-500"} rounded-full flex items-center justify-center`}
                >
                  {transactionResult.success ? (
                    <Check className="w-10 h-10 text-white" />
                  ) : (
                    <motion.div initial={{ rotate: 0 }} animate={{ rotate: 45 }} className="w-10 h-10 text-white">
                      <ArrowRight className="w-10 h-10" />
                    </motion.div>
                  )}
                </motion.div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {transactionResult.success ? "Transaction Successful!" : "Transaction Failed"}
                </h2>
                <p className="text-white/70 max-w-md mx-auto">
                  {transactionResult.success
                    ? "Your payment has been processed successfully."
                    : "Your payment could not be processed. Please try again."}
                </p>
              </div>

              <div className="bg-white/5 p-6 rounded-xl">
                <h3 className="text-lg font-medium text-white mb-4">Transaction Details</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Transaction ID</p>
                      <p className="text-white font-mono">{transactionResult.id}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Date & Time</p>
                      <p className="text-white">{new Date(transactionResult.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Merchant</p>
                      <p className="text-white">{transactionResult.merchant}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Card</p>
                      <p className="text-white">•••• •••• •••• {cardDetails.cardNumber.slice(-4)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Amount</p>
                      <p className="text-white font-medium">
                        {transactionDetails.currency} {transactionResult.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Fee</p>
                      <p className="text-white">
                        {transactionDetails.currency} {transactionResult.fee}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Total</p>
                      <p className="text-white font-bold">
                        {transactionDetails.currency}{" "}
                        {(
                          Number.parseFloat(transactionResult.amount) + Number.parseFloat(transactionResult.fee)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={resetTransaction}
                  className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold px-8 py-4 rounded-xl"
                >
                  Simulate Another Transaction
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}