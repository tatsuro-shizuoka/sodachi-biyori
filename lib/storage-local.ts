
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'faces')

export async function saveFaceThumbnail(imageBuffer: Buffer): Promise<string> {
    try {
        // Ensure directory exists
        await fs.mkdir(UPLOAD_DIR, { recursive: true })

        const fileName = `${uuidv4()}.jpg`
        const filePath = path.join(UPLOAD_DIR, fileName)

        await fs.writeFile(filePath, imageBuffer)

        // Return public URL
        return `/uploads/faces/${fileName}`
    } catch (error) {
        console.error('Failed to save face thumbnail:', error)
        return ''
    }
}
