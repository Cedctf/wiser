"use client"

import { motion } from "framer-motion"
import { Wallet } from "lucide-react"

export default function CardDisplay() {
  return (
    <motion.div
      className="md:w-1/2 relative h-[400px] md:h-[500px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      style={{ perspective: "1200px" }}
    >
      {/* Black Card */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[350px] h-[220px] rounded-xl overflow-hidden"
        initial={{ y: 0, x: "-50%", rotateY: -15, rotateX: 15, translateY: "-50%" }}
        animate={{ 
          y: [0, -50, -50, 0],
          x: ["-50%", "-80%", "-80%", "-50%"],
          rotateY: [-15, -15, -15, -15],
          rotateX: [15, 15, 15, 15],
          z: [0, 70, 70, 0]
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
          times: [0, 0.3, 0.7, 1]
        }}
        style={{ 
          transformStyle: "preserve-3d",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          transform: "translate(-50%, -50%) rotateX(15deg) rotateY(-15deg)"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 flex flex-col justify-between transform-style-preserve-3d">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="text-yellow-400 font-bold text-lg">WISER</div>
              <div className="text-white/60 text-xs">PREMIUM</div>
            </div>
            <div className="w-12 h-10 rounded-md flex items-center justify-center">
              <Wallet className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          
          {/* EMV Chip - More realistic */}
          <div className="w-12 h-10 mt-2">
            <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md flex items-center justify-center overflow-hidden">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-yellow-800/30 w-full h-full"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-white font-mono text-lg tracking-widest mb-2">4689 1234 5678 9012</div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white/60 text-xs mb-1">CARD HOLDER</div>
                <div className="text-white text-sm">ALEX MORGAN</div>
              </div>
              <div>
                <div className="text-white/60 text-xs mb-1">EXPIRES</div>
                <div className="text-white text-sm">05/28</div>
              </div>
              <div className="flex items-center">
                <div className="text-yellow-400 font-bold">SOL</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Pink Card */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[350px] h-[220px] rounded-xl overflow-hidden"
        initial={{ y: 0, x: "-50%", rotateY: 0, rotateX: 10, translateY: "-50%" }}
        animate={{ 
          y: [0, 50, 50, 0],
          x: ["-50%", "-20%", "-20%", "-50%"],
          rotateY: [0, 0, 0, 0],
          rotateX: [10, 10, 10, 10],
          z: [0, 50, 50, 0]
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
          times: [0, 0.3, 0.7, 1]
        }}
        style={{ 
          transformStyle: "preserve-3d",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          transform: "translate(-50%, -50%) rotateX(10deg) rotateY(0deg)"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 flex flex-col justify-between transform-style-preserve-3d">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="text-white font-bold text-lg">WISER</div>
              <div className="text-white/60 text-xs">PLATINUM</div>
            </div>
            <div className="w-12 h-10 rounded-md flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* EMV Chip - More realistic */}
          <div className="w-12 h-10 mt-2">
            <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md flex items-center justify-center overflow-hidden">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-yellow-800/30 w-full h-full"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-white font-mono text-lg tracking-widest mb-2">5678 9012 3456 7890</div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white/60 text-xs mb-1">CARD HOLDER</div>
                <div className="text-white text-sm">JAMIE SMITH</div>
              </div>
              <div>
                <div className="text-white/60 text-xs mb-1">EXPIRES</div>
                <div className="text-white text-sm">09/27</div>
              </div>
              <div className="flex items-center">
                <div className="text-white font-bold">SOL</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Purple Card */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[350px] h-[220px] rounded-xl overflow-hidden"
        initial={{ y: 0, x: "-50%", rotateY: 15, rotateX: 5, translateY: "-50%" }}
        animate={{ 
          y: [0, -30, -30, 0],
          x: ["-50%", "0%", "0%", "-50%"],
          rotateY: [15, 15, 15, 15],
          rotateX: [5, 5, 5, 5],
          z: [0, 40, 40, 0]
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
          times: [0, 0.3, 0.7, 1]
        }}
        style={{ 
          transformStyle: "preserve-3d",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          transform: "translate(-50%, -50%) rotateX(5deg) rotateY(15deg)"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-800 rounded-xl p-6 flex flex-col justify-between transform-style-preserve-3d">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="text-white font-bold text-lg">WISER</div>
              <div className="text-white/60 text-xs">INFINITE</div>
            </div>
            <div className="w-12 h-10 rounded-md flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* EMV Chip - More realistic */}
          <div className="w-12 h-10 mt-2">
            <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md flex items-center justify-center overflow-hidden">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-yellow-800/30 w-full h-full"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-white font-mono text-lg tracking-widest mb-2">9012 3456 7890 1234</div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white/60 text-xs mb-1">CARD HOLDER</div>
                <div className="text-white text-sm">TAYLOR WILSON</div>
              </div>
              <div>
                <div className="text-white/60 text-xs mb-1">EXPIRES</div>
                <div className="text-white text-sm">11/26</div>
              </div>
              <div className="flex items-center">
                <div className="text-white font-bold">SOL</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Card reflections/shadows */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-white/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      />
    </motion.div>
  )
} 