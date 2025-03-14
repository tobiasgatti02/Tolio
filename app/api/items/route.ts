import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from 'uuid'  // Import UUID properly

export async function POST(request: Request) {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    try {
      const formData = await request.formData()
      
      // Extract text fields
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const categoryName = formData.get('category') as string
      const price = parseFloat(formData.get('price') as string)
      const deposit = parseFloat(formData.get('deposit') as string)
      const location = formData.get('location') as string
      const featuresRaw = formData.get('features') as string
      const features = featuresRaw ? JSON.parse(featuresRaw) : []
  
      // Basic validation
      if (!title || !description || !categoryName || isNaN(price) || isNaN(deposit) || !location) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }
  
      // Find the category by name to get its ID
      const category = await prisma.category.findUnique({
        where: { name: categoryName },
        select: { id: true }
      })
  
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        )
      }
  
      // Handle image uploads
      const imageFiles = formData.getAll('images') as File[]
      const imageUrls: string[] = []
  
      if (imageFiles && imageFiles.length > 0) {
        // Process each image file
        for (const imageFile of imageFiles) {
          if (imageFile.size > 0) {
            // Generate a unique filename
            const filename = `${uuidv4()}-${imageFile.name.replace(/\s/g, '_')}`
            
            try {
              // Upload to storage service
              const blob = await put(filename, imageFile, {
                access: 'public',
              })
              
              imageUrls.push(blob.url)
            } catch (uploadError) {
              console.error('Error uploading image:', uploadError)
              // Continue with other images even if one fails
            }
          }
        }
      }
  
      // Create the item in the database with proper category association
      const newItem = await prisma.item.create({
        data: {
          title,
          description,
          price,
          deposit,
          location,
          features,
          images: imageUrls,
          ownerId: session.user.id,
          isAvailable: true,
          categoryId: category.id, // Set the proper category ID
        }
      })
  
      return NextResponse.json(newItem, { status: 201 })
    } catch (error) {
      console.error("Error creating item:", error)
      return NextResponse.json(
        { error: "Failed to create item" }, 
        { status: 500 }
      )
    }
  }