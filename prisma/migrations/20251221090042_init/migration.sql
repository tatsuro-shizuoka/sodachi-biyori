-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN "ctaText" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "SponsorImpression" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT NOT NULL,
    "schoolId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SponsorImpression_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SponsorClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT NOT NULL,
    "schoolId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SponsorClick_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SponsorImpression_sponsorId_idx" ON "SponsorImpression"("sponsorId");

-- CreateIndex
CREATE INDEX "SponsorImpression_schoolId_idx" ON "SponsorImpression"("schoolId");

-- CreateIndex
CREATE INDEX "SponsorClick_sponsorId_idx" ON "SponsorClick"("sponsorId");

-- CreateIndex
CREATE INDEX "SponsorClick_schoolId_idx" ON "SponsorClick"("schoolId");
