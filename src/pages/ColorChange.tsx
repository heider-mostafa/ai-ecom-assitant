"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Wand2 } from "lucide-react"
import { FileUpload } from "../components/FileUpload"

// API Credentials
const API_EMAIL = "mostafa.heider9@gmail.com"
const API_PASSWORD = "DoDo1962004!"

interface ColorChangeState {
  image: File | null
  clothingText: string
  hexColor: string
  result: string | null
  loading: boolean
  error: string | null
}

export function ColorChange() {
  const [state, setState] = useState<ColorChangeState>({
    image: null,
    clothingText: "",
    hexColor: "",
    result: null,
    loading: false,
    error: null,
  })

  const handleImageUpload = useCallback((file: File) => {
    setState((prev) => ({ ...prev, image: file }))
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setState((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!state.image) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        // First, upload the image to get a URL
        const imageUrl = await uploadToServer(state.image)

        const formData = new FormData()
        formData.append("email", API_EMAIL)
        formData.append("password", API_PASSWORD)
        formData.append("image", imageUrl)
        formData.append("clothing_text", state.clothingText)
        formData.append("Hex_color", state.hexColor)

        console.log("Sending request with data:", Object.fromEntries(formData))

        const response = await fetch("https://thenewblack.ai/api/1.1/wf/color_change", {
          method: "POST",
          body: formData,
        })

        console.log("Response status:", response.status)
        const responseText = await response.text()
        console.log("Response text:", responseText)

        if (!response.ok) {
          throw new Error(`Failed to change color: ${responseText}`)
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          result: responseText,
        }))
      } catch (error) {
        console.error("Error:", error)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "An error occurred",
        }))
      }
    },
    [state.image, state.clothingText, state.hexColor],
  )

  // Function to upload image to server and get URL
  const uploadToServer = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "ai-ecom-assitant")
    formData.append("cloud_name", "dyx5l8r9o")

    const response = await fetch("https://api.cloudinary.com/v1_1/dyx5l8r9o/image/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    return data.secure_url
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Change Color</h1>
        <p className="text-gray-600">Change the color of clothing in your image using AI</p>
      </motion.div>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileUpload
            label="Upload image"
            onFileSelect={handleImageUpload}
            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
            preview={state.image ? URL.createObjectURL(state.image) : null}
          />
          <div className="space-y-4">
            <input
              type="text"
              name="clothingText"
              value={state.clothingText}
              onChange={handleInputChange}
              placeholder="Describe the garment (e.g., shirt, dress)"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="hexColor"
              value={state.hexColor}
              onChange={handleInputChange}
              placeholder="Hex color code (e.g., #799d7a)"
              className="w-full p-2 border rounded"
              required
              pattern="^#[0-9A-Fa-f]{6}$"
              title="Please enter a valid hex color code (e.g., #799d7a)"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!state.image || state.loading}
            className={`
              w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2
              ${
                state.loading || !state.image
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }
              transition-colors duration-200
            `}
          >
            <Wand2 className="w-5 h-5" />
            <span>{state.loading ? "Changing Color..." : "Change Color"}</span>
          </motion.button>
          {state.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{state.error}</div>}
        </div>
        {state.result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-4 shadow-lg"
          >
            <img
              src={state.result || "/placeholder.svg"}
              alt="Color changed image"
              className="w-full h-auto rounded-lg"
            />
          </motion.div>
        )}
      </form>
    </div>
  )
}

