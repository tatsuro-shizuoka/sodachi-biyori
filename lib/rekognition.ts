import { RekognitionClient, CreateCollectionCommand, IndexFacesCommand, SearchFacesByImageCommand, DeleteFacesCommand, DetectFacesCommand } from '@aws-sdk/client-rekognition'

// Initialize Rekognition client
const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})

// Collection name for this app
const COLLECTION_ID = process.env.AWS_REKOGNITION_COLLECTION || 'kindergarten-faces'

/**
 * Create the face collection if it doesn't exist
 */
export async function ensureCollectionExists(): Promise<void> {
    try {
        await rekognition.send(new CreateCollectionCommand({
            CollectionId: COLLECTION_ID,
        }))
        console.log(`[Rekognition] Collection "${COLLECTION_ID}" created`)
    } catch (error: any) {
        if (error.name === 'ResourceAlreadyExistsException') {
            // Collection already exists, this is fine
        } else {
            throw error
        }
    }
}

/**
 * Register a child's face from an image
 * @param childId - The child's database ID (used as ExternalImageId)
 * @param imageBytes - The image data as Buffer
 * @returns The AWS Rekognition FaceId
 */
export async function registerFace(childId: string, imageBytes: Buffer): Promise<string | null> {
    await ensureCollectionExists()

    const response = await rekognition.send(new IndexFacesCommand({
        CollectionId: COLLECTION_ID,
        Image: {
            Bytes: imageBytes,
        },
        ExternalImageId: childId, // Link to our database ID
        MaxFaces: 1, // Only index the most prominent face
        QualityFilter: 'AUTO',
        DetectionAttributes: ['DEFAULT'],
    }))

    if (response.FaceRecords && response.FaceRecords.length > 0) {
        const faceId = response.FaceRecords[0].Face?.FaceId
        console.log(`[Rekognition] Face registered for child ${childId}: ${faceId}`)
        return faceId || null
    }

    console.log(`[Rekognition] No face detected in image for child ${childId}`)
    return null
}

/**
 * Search for a face in the collection
 * @param imageBytes - The image to search for
 * @param threshold - Similarity threshold (0-100)
 * @returns Array of matches with childId and confidence
 */
export async function searchFace(imageBytes: Buffer, threshold: number = 80): Promise<Array<{ childId: string; confidence: number; faceId: string }>> {
    await ensureCollectionExists()

    try {
        const response = await rekognition.send(new SearchFacesByImageCommand({
            CollectionId: COLLECTION_ID,
            Image: {
                Bytes: imageBytes,
            },
            MaxFaces: 10,
            FaceMatchThreshold: threshold,
        }))

        const matches = response.FaceMatches?.map(match => ({
            childId: match.Face?.ExternalImageId || '',
            confidence: match.Similarity || 0,
            faceId: match.Face?.FaceId || '',
        })).filter(m => m.childId) || []

        return matches
    } catch (error: any) {
        if (error.name === 'InvalidParameterException') {
            // No face in search image
            return []
        }
        throw error
    }
}

/**
 * Delete a face from the collection
 * @param faceId - The AWS Rekognition FaceId to delete
 */
export async function deleteFace(faceId: string): Promise<void> {
    await rekognition.send(new DeleteFacesCommand({
        CollectionId: COLLECTION_ID,
        FaceIds: [faceId],
    }))
    console.log(`[Rekognition] Face ${faceId} deleted from collection`)
}

import { FaceDetail } from '@aws-sdk/client-rekognition'

/**
 * Detect faces in an image without searching collection
 * Returns full details including bounding boxes.
 */
export async function detectFaces(imageBytes: Buffer): Promise<FaceDetail[]> {
    try {
        const response = await rekognition.send(new DetectFacesCommand({
            Image: { Bytes: imageBytes },
            Attributes: ['DEFAULT']
        }))
        return response.FaceDetails || []
    } catch (e) {
        console.error('[Rekognition] DetectFaces error:', e)
        return []
    }
}

export { COLLECTION_ID }
