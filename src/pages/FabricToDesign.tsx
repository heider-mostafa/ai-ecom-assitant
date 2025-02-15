"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Wand2 } from "lucide-react"
import { FileUpload } from "../components/FileUpload"

// API Credentials
const API_EMAIL = "mostafa.heider9@gmail.com"
const API_PASSWORD = "DoDo1962004!"

interface FabricToDesignState {
  fabricImage: File | null
  clothingPrompt: string
  gender: "man" | "woman"
  country: string
  age: number
  result: string | null
  loading: boolean
  error: string | null
}

export function FabricToDesign() {
  const [state, setState] = useState<FabricToDesignState>({
    fabricImage: null,
    clothingPrompt: "",
    gender: "woman",
    country: "",
    age: 30,
    result: null,
    loading: false,
    error: null,
  })

  const handleFabricUpload = useCallback((file: File) => {
    setState((prev) => ({ ...prev, fabricImage: file }))
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setState((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!state.fabricImage) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        // First, upload the image to get a URL
        const imageUrl = await uploadToServer(state.fabricImage)

        const formData = new FormData()
        formData.append("email", API_EMAIL)
        formData.append("password", API_PASSWORD)
        formData.append("fabric_image", imageUrl)
        formData.append("clothing_prompt", state.clothingPrompt)
        formData.append("gender", state.gender)
        formData.append("country", state.country)
        formData.append("age", state.age.toString())

        console.log("Sending request with data:", Object.fromEntries(formData))

        const response = await fetch("https://thenewblack.ai/api/1.1/wf/fabric_to_design", {
          method: "POST",
          body: formData,
        })

        console.log("Response status:", response.status)
        const responseText = await response.text()
        console.log("Response text:", responseText)

        if (!response.ok) {
          throw new Error(`Failed to generate design: ${responseText}`)
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
    [state.fabricImage, state.clothingPrompt, state.gender, state.country, state.age],
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Fabric to Design</h1>
        <p className="text-gray-600">Create clothing designs from fabric patterns using AI</p>
      </motion.div>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileUpload
            label="Upload fabric image"
            onFileSelect={handleFabricUpload}
            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
            preview={state.fabricImage ? URL.createObjectURL(state.fabricImage) : null}
          />
          <div className="space-y-4">
            <input
              type="text"
              name="clothingPrompt"
              value={state.clothingPrompt}
              onChange={handleInputChange}
              placeholder="Describe the clothing (e.g., dress, shirt)"
              className="w-full p-2 border rounded"
              required
            />
            <select
              name="gender"
              value={state.gender}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="woman">Woman</option>
              <option value="man">Man</option>
            </select>
            <input
              type="text"
              name="country"
              value={state.country}
              onChange={handleInputChange}
              placeholder="Country (e.g., Brazil, France)"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="age"
              value={state.age}
              onChange={handleInputChange}
              min="20"
              max="70"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!state.fabricImage || state.loading}
            className={`
              w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2
              ${
                state.loading || !state.fabricImage
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }
              transition-colors duration-200
            `}
          >
            <Wand2 className="w-5 h-5" />
            <span>{state.loading ? "Generating..." : "Generate Design"}</span>
          </motion.button>
          {state.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{state.error}</div>}
        </div>
        {state.result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-4 shadow-lg"
          >
            <img src={state.result || "/placeholder.svg"} alt="Generated design" className="w-full h-auto rounded-lg" />
          </motion.div>
        )}
      </form>
    </div>
  )
}

