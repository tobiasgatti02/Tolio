import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"
import type { Express } from "express"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const fileExtension = file.originalname.split(".").pop()
  const fileName = `${uuidv4()}.${fileExtension}`

  const params = {
    Bucket: process.env.AWS_S3_BUCKET || "",
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  }

  try {
    await s3Client.send(new PutObjectCommand(params))

    // Return the URL to the uploaded file
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
  } catch (error) {
    console.error("Error uploading file to S3:", error)
    throw error
  }
}

