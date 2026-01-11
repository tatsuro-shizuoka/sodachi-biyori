-- AlterTable
ALTER TABLE "Child" ADD COLUMN "faceId" TEXT;
ALTER TABLE "Child" ADD COLUMN "faceImageUrl" TEXT;
ALTER TABLE "Child" ADD COLUMN "faceRegisteredAt" DATETIME;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN "analysisStatus" TEXT DEFAULT 'pending';

-- CreateTable
CREATE TABLE "ChildFace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "faceId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChildFace_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SponsorSupport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT,
    "schoolId" TEXT,
    "guardianId" TEXT,
    "amount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SponsorSupport_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SponsorSupport" ("createdAt", "guardianId", "id", "schoolId", "sponsorId") SELECT "createdAt", "guardianId", "id", "schoolId", "sponsorId" FROM "SponsorSupport";
DROP TABLE "SponsorSupport";
ALTER TABLE "new_SponsorSupport" RENAME TO "SponsorSupport";
CREATE INDEX "SponsorSupport_sponsorId_idx" ON "SponsorSupport"("sponsorId");
CREATE INDEX "SponsorSupport_schoolId_idx" ON "SponsorSupport"("schoolId");
CREATE INDEX "SponsorSupport_guardianId_idx" ON "SponsorSupport"("guardianId");
CREATE TABLE "new_VideoFaceTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "childId" TEXT,
    "label" TEXT,
    "thumbnailUrl" TEXT DEFAULT '',
    "startTime" REAL NOT NULL,
    "endTime" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "isTentative" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoFaceTag_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoFaceTag_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VideoFaceTag" ("childId", "confidence", "createdAt", "endTime", "id", "label", "startTime", "thumbnailUrl", "videoId") SELECT "childId", "confidence", "createdAt", "endTime", "id", "label", "startTime", "thumbnailUrl", "videoId" FROM "VideoFaceTag";
DROP TABLE "VideoFaceTag";
ALTER TABLE "new_VideoFaceTag" RENAME TO "VideoFaceTag";
CREATE INDEX "VideoFaceTag_videoId_idx" ON "VideoFaceTag"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ChildFace_childId_idx" ON "ChildFace"("childId");
