-- CreateTable
CREATE TABLE "ReactionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "guardianId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReactionLog_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReactionLog_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StampCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guardianId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "stamps" TEXT NOT NULL,
    "lastStampedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StampCard_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SponsorSupport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT NOT NULL,
    "schoolId" TEXT,
    "guardianId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SponsorSupport_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoFaceTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "childId" TEXT,
    "label" TEXT,
    "startTime" REAL NOT NULL,
    "endTime" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoFaceTag_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoFaceTag_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "grade" TEXT,
    "schoolYear" TEXT,
    "password" TEXT NOT NULL,
    "adminMemo" TEXT,
    "schoolId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Class" ("adminMemo", "createdAt", "grade", "id", "name", "password", "schoolId", "schoolYear", "updatedAt") SELECT "adminMemo", "createdAt", "grade", "id", "name", "password", "schoolId", "schoolYear", "updatedAt" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
CREATE TABLE "new_School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adminMemo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "enableReactions" BOOLEAN NOT NULL DEFAULT true,
    "enableStampCard" BOOLEAN NOT NULL DEFAULT true,
    "popDisplayMode" TEXT NOT NULL DEFAULT 'priority'
);
INSERT INTO "new_School" ("adminMemo", "createdAt", "id", "name", "slug", "updatedAt") SELECT "adminMemo", "createdAt", "id", "name", "slug", "updatedAt" FROM "School";
DROP TABLE "School";
ALTER TABLE "new_School" RENAME TO "School";
CREATE UNIQUE INDEX "School_slug_key" ON "School"("slug");
CREATE TABLE "new_Sponsor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "position" TEXT NOT NULL DEFAULT 'footer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "ctaText" TEXT,
    "videoUrl" TEXT,
    "displayStyle" TEXT NOT NULL DEFAULT 'banner',
    "displayFrequency" TEXT NOT NULL DEFAULT 'always',
    "contentType" TEXT NOT NULL DEFAULT 'image',
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "schoolId" TEXT,
    CONSTRAINT "Sponsor_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Sponsor" ("createdAt", "ctaText", "id", "imageUrl", "isActive", "linkUrl", "name", "position", "priority", "schoolId", "updatedAt", "videoUrl") SELECT "createdAt", "ctaText", "id", "imageUrl", "isActive", "linkUrl", "name", "position", "priority", "schoolId", "updatedAt", "videoUrl" FROM "Sponsor";
DROP TABLE "Sponsor";
ALTER TABLE "new_Sponsor" RENAME TO "Sponsor";
CREATE INDEX "Sponsor_schoolId_idx" ON "Sponsor"("schoolId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ReactionLog_videoId_idx" ON "ReactionLog"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "StampCard_guardianId_year_key" ON "StampCard"("guardianId", "year");

-- CreateIndex
CREATE INDEX "SponsorSupport_sponsorId_idx" ON "SponsorSupport"("sponsorId");

-- CreateIndex
CREATE INDEX "SponsorSupport_schoolId_idx" ON "SponsorSupport"("schoolId");

-- CreateIndex
CREATE INDEX "VideoFaceTag_videoId_idx" ON "VideoFaceTag"("videoId");
