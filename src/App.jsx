import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, Shield } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-indigo-600 mb-4"
          >
            Digital Allies V2
          </motion.h1>
          <p className="text-gray-600 mb-8">
            React + Vite + Tailwind CSS + Framer Motion + Lucide React
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-indigo-50 rounded-lg"
            >
              <Heart className="w-12 h-12 mx-auto text-indigo-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Care</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-indigo-50 rounded-lg"
            >
              <Users className="w-12 h-12 mx-auto text-indigo-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Community</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-indigo-50 rounded-lg"
            >
              <Shield className="w-12 h-12 mx-auto text-indigo-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Security</h3>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors"
          >
            Count is {count}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default App
