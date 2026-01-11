/**
 * Night Batch Script for Face Recognition
 * 
 * Runs through all videos and searches for registered children's faces.
 * Results are saved to the database for instant display on video pages.
 * 
 * Run with: npx ts-node scripts/batch-face-search.ts
 * Schedule with cron: 0 2 * * * (2 AM daily)
 */

import { PrismaClient } from '@prisma/client'
import { runFaceSearchForVideos } from '../lib/face-search'

const prisma = new PrismaClient()

async function runBatchFaceSearch() {
    console.log('[Batch] Starting face search batch job...')
    console.log(`[Batch] Time: ${new Date().toISOString()}`)

    await runFaceSearchForVideos(prisma, console.log)
}

// Main
runBatchFaceSearch()
    .then(() => {
        console.log('[Batch] Job finished successfully')
        process.exit(0)
    })
    .catch(error => {
        console.error('[Batch] Job failed:', error)
        process.exit(1)
    })
    .finally(() => {
        prisma.$disconnect()
    })
