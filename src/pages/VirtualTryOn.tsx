"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wand2 } from "lucide-react"
import { FileUpload } from "../components/FileUpload"
import { TypeSelector } from "../components/TypeSelector"
import type { UploadState, ClothingType } from "../types"

// API Credentials
const API_EMAIL = "mostafa.heider9@gmail.com"
const API_PASSWORD = "DoDo1962004!"

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dyx5l8r9o"
const CLOUDINARY_UPLOAD_PRESET = "ai-ecom-assitant"

// Upload image to Cloudinary and return public URL
async function uploadToServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary")
  }

  const data = await response.json()
  console.log("Uploaded Image URL:", data.secure_url)
  return data.secure_url
}

// Generate try-on and get ID
async function generateTryOn(modelUrl: string, clothingUrl: string, clothingType: ClothingType): Promise<string> {
  const formData = new FormData()
  formData.append("email", API_EMAIL)
  formData.append("password", API_PASSWORD)
  formData.append("model_photo", modelUrl)
  formData.append("clothing_photo", clothingUrl)
  formData.append("clothing_type", clothingType)

  const response = await fetch("https://thenewblack.ai/api/1.1/wf/vto", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to generate try-on")
  }

  const id = await response.text()
  console.log("Generated ID:", id)
  return id
}

// Retrieve results using the ID
async function getResults(id: string): Promise<string> {
  const formData = new FormData()
  formData.append("email", API_EMAIL)
  formData.append("password", API_PASSWORD)
  formData.append("id", id)

  let retries = 10 // Increase maximum number of retries
  while (retries > 0) {
    console.log(`Retrieving results... Attempt ${11 - retries}`)

    const response = await fetch("https://thenewblack.ai/api/1.1/wf/results", {
      method: "POST",
      body: formData,
    })

    console.log("Response Status:", response.status)
    console.log("Response OK:", response.ok)

    if (response.ok) {
      const resultUrl = await response.text()
      console.log("Result URL Retrieved:", resultUrl)
      return resultUrl
    }

    retries--
    if (retries === 0) {
      console.error("Failed to retrieve results after multiple attempts")
      throw new Error("Failed to retrieve results after multiple attempts")
    }

    console.log("Waiting 5 seconds before retrying...")
    await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds before retrying
  }

  throw new Error("Failed to retrieve results")
}

export function VirtualTryOn() {
  const [state, setState] = useState<UploadState>({
    modelImage: null,
    clothingImage: null,
    clothingType: "tops",
    result: null,
    loading: false,
    error: null,
  })

  const handleModelUpload = useCallback((file: File) => {
    setState((prev) => ({ ...prev, modelImage: file }))
  }, [])

  const handleClothingUpload = useCallback((file: File) => {
    setState((prev) => ({ ...prev, clothingImage: file }))
  }, [])

  const handleTypeChange = useCallback((type: ClothingType) => {
    setState((prev) => ({ ...prev, clothingType: type }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!state.modelImage || !state.clothingImage) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      // Step 1: Upload images to get URLs
      const [modelUrl, clothingUrl] = await Promise.all([
        uploadToServer(state.modelImage),
        uploadToServer(state.clothingImage),
      ])

      console.log("Model URL:", modelUrl)
      console.log("Clothing URL:", clothingUrl)

      // Step 2: Generate try-on and get ID
      const id = await generateTryOn(modelUrl, clothingUrl, state.clothingType)

      // Step 3: Retrieve results
      const resultUrl = await getResults(id)

      setState((prev) => ({
        ...prev,
        loading: false,
        result: resultUrl,
      }))
    } catch (error) {
      console.error("Error:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred",
      }))
    }
  }, [state.modelImage, state.clothingImage, state.clothingType])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Virtual Try-On</h1>
        <p className="text-gray-600">Experience how clothes look on you with AI-powered virtual try-on</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileUpload
            label="Upload your photo"
            onFileSelect={handleModelUpload}
            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
            preview={state.modelImage ? URL.createObjectURL(state.modelImage) : null}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Select clothing type</h3>
            <TypeSelector value={state.clothingType} onChange={handleTypeChange} />
          </div>
          <FileUpload
            label="Upload clothing item"
            onFileSelect={handleClothingUpload}
            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
            preview={state.clothingImage ? URL.createObjectURL(state.clothingImage) : null}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!state.modelImage || !state.clothingImage || state.loading}
            className={`
              w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2
              ${
                state.loading || !state.modelImage || !state.clothingImage
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }
              transition-colors duration-200
            `}
          >
            <Wand2 className="w-5 h-5" />
            <span>{state.loading ? "Processing (this may take up to 40 seconds)..." : "Generate Try-On"}</span>
          </motion.button>
          {state.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{state.error}</div>}
        </div>
        <AnimatePresence>
          {state.result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-4 shadow-lg"
            >
              <img
                src={state.result || "/placeholder.svg"}
                alt="Virtual try-on result"
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

