import { motion } from "framer-motion"
import { LogIn, Palette, Shirt, Image, Wand2 } from "lucide-react"
import { Link } from "./Link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/75 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            StyleSync
          </Link>
        </motion.div>

        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" icon={Wand2}>
              Virtual Try-On
            </Link>
            <Link href="/fabric-to-design" icon={Palette}>
              Fabric to Design
            </Link>
            <Link href="/ai-models" icon={Shirt}>
              AI Models
            </Link>
            <Link href="/color-change" icon={Image}>
              Change Color
            </Link>
            <Link href="/background" icon={Image}>
              Background
            </Link>
          </nav>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-1 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </motion.button>
        </div>
      </div>
    </header>
  )
}

