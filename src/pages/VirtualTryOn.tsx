"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wand2, Loader2 } from "lucide-react"
import { FileUpload } from "../components/FileUpload"
import { TypeSelector } from "../components/TypeSelector"
import type { UploadState, ClothingType } from "../types"

/**
 * TODO: 
 * Optimise the getResults function to avoid unnecessary retries
 * Maybe add a loading spinner? 
 * Add a "Try Again" button in case of error (optional)
 * Implement function to download the result image.
 * 
 */

// store API credentials in a .env file 
const API_EMAIL = "mostafa.heider9@gmail.com"
const API_PASSWORD = "DoDo1962004!"
const CLOUDINARY_CLOUD_NAME = "dyx5l8r9o"
const CLOUDINARY_UPLOAD_PRESET = "ai-ecom-assitant"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function uploadToServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary")
  }

  const data = await response.json()
  console.log("Uploaded Image URL:", data.secure_url)
  return data.secure_url
}

async function generateTryOn(
  modelUrl: string,
  clothingUrl: string,
  clothingType: ClothingType
): Promise<string> {
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

async function getResults(id: string): Promise<string> {
  const maxRetries = 20

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Retrieving results... Attempt ${attempt}`)

    try {
      const formData = new FormData()
      formData.append("email", API_EMAIL)
      formData.append("password", API_PASSWORD)
      formData.append("id", id)

      const response = await fetch("https://thenewblack.ai/api/1.1/wf/results", {
        method: "POST",
        body: formData,
        headers: { "Accept": "*/*" },
      })
      const trimmedResponse = (await response.text()).trim()
      console.log("Response Status:", response.status)

      if (response.ok) {
        if (trimmedResponse === "Processing...") {
          console.log("Still processing, waiting 5 seconds...")
        } else if (trimmedResponse.startsWith("http")) {
          return trimmedResponse
        } else {
          console.error("Unexpected response:", trimmedResponse)
        }
      }
    } catch (error) {
      console.error("Network error:", error)
    }

    if (attempt < maxRetries) {
      await sleep(5000)
    }
  }

  throw new Error("Failed to retrieve results after maximum attempts")
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

  const { modelImage, clothingImage, clothingType, loading, error, result } = state

  const [modelPreview, setModelPreview] = useState<string | null>(null)
  const [clothingPreview, setClothingPreview] = useState<string | null>(null)

  useEffect(() => {
    if (modelImage) {
      const url = URL.createObjectURL(modelImage)
      setModelPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setModelPreview(null)
  }, [modelImage])

  useEffect(() => {
    if (clothingImage) {
      const url = URL.createObjectURL(clothingImage)
      setClothingPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setClothingPreview(null)
  }, [clothingImage])

  const handleModelUpload = useCallback((file: File) => {
    setState(prev => ({ ...prev, modelImage: file }))
  }, [])

  const handleClothingUpload = useCallback((file: File) => {
    setState(prev => ({ ...prev, clothingImage: file }))
  }, [])

  const handleTypeChange = useCallback((type: ClothingType) => {
    setState(prev => ({ ...prev, clothingType: type }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!modelImage || !clothingImage) return

    setState(prev => ({ ...prev, loading: true, error: null, result: null }))

    try {
      const [modelUrl, clothingUrl] = await Promise.all([
        uploadToServer(modelImage),
        uploadToServer(clothingImage),
      ])
      console.log("Model URL:", modelUrl)
      console.log("Clothing URL:", clothingUrl)

      const id = await generateTryOn(modelUrl, clothingUrl, clothingType)

      const resultUrl = await getResults(id)
      setState(prev => ({ ...prev, loading: false, result: resultUrl }))
    } catch (error) {
      console.error("Error:", error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred",
      }))
    }
  }, [modelImage, clothingImage, clothingType])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Virtual Try-On</h1>
        <p className="text-gray-600">
          Experience how clothes look on you with AI-powered virtual try-on
        </p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileUpload
            label="Upload your photo"
            onFileSelect={handleModelUpload}
            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
            preview={modelPreview}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Select clothing type</h3>
            <TypeSelector value={clothingType} onChange={handleTypeChange} />
          </div>

          <FileUpload
            label="Upload clothing item"
            onFileSelect={handleClothingUpload}
            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
            preview={clothingPreview}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!modelImage || !clothingImage || loading}
            className={`w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 ${
              loading || !modelImage || !clothingImage
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span>
              {loading
                ? "Processing (this may take up to 40 seconds)..."
                : "Generate Try-On"}
            </span>
          </motion.button>

          {/* Optional error message with a Try Again button */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={handleSubmit} className="text-blue-500 hover:underline">
                Try Again
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-4 shadow-lg"
            >
              <img
                src={result || "/placeholder.svg"}
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
