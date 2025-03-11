"use client"

import { useState } from "react"
import Image from "next/image"

interface ItemGalleryProps {
  images: string[]
}

export default function ItemGallery({ images }: ItemGalleryProps) {
  const [activeImage, setActiveImage] = useState(0)

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden">
        <Image src={images[activeImage] || "/placeholder.svg"} alt="Item image" fill className="object-cover" />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(index)}
            className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden ${
              activeImage === index ? "ring-2 ring-emerald-500" : "opacity-70"
            }`}
          >
            <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

