-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adminMemo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enableReactions" BOOLEAN NOT NULL DEFAULT true,
    "enableStampCard" BOOLEAN NOT NULL DEFAULT true,
    "enableAiAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "popDisplayMode" TEXT NOT NULL DEFAULT 'priority',

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "grade" TEXT,
    "schoolYear" TEXT,
    "password" TEXT NOT NULL,
    "adminMemo" TEXT,
    "schoolId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "vimeoVideoId" TEXT,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "recordedOn" TIMESTAMP(3),
    "durationSec" INTEGER,
    "adminMemo" TEXT,
    "isDownloadable" BOOLEAN NOT NULL DEFAULT false,
    "isAllClasses" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "analysisStatus" TEXT DEFAULT 'pending',

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoView" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "guardianId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSec" INTEGER,
    "deviceType" TEXT,

    CONSTRAINT "VideoView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReactionLog" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "guardianId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReactionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StampCard" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "stamps" TEXT NOT NULL,
    "lastStampedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StampCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "position" TEXT NOT NULL DEFAULT 'footer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "ctaText" TEXT,
    "videoUrl" TEXT,
    "displayStyle" TEXT NOT NULL DEFAULT 'banner',
    "displayFrequency" TEXT NOT NULL DEFAULT 'always',
    "contentType" TEXT NOT NULL DEFAULT 'image',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorImpression" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "schoolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorClick" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "schoolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorSupport" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT,
    "schoolId" TEXT,
    "guardianId" TEXT,
    "amount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorSupport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthday" TIMESTAMP(3),
    "faceId" TEXT,
    "faceImageUrl" TEXT,
    "faceRegisteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildFace" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "faceId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChildFace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianChild" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "GuardianChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildClassroom" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolYear" TEXT,

    CONSTRAINT "ChildClassroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianClassroomSetting" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "notifyNewVideo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuardianClassroomSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoFaceTag" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "childId" TEXT,
    "label" TEXT,
    "thumbnailUrl" TEXT DEFAULT '',
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "isTentative" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoFaceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrerollAd" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "linkUrl" TEXT,
    "ctaText" TEXT,
    "skipAfterSeconds" INTEGER NOT NULL DEFAULT 5,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "schoolId" TEXT,
    "sponsorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrerollAd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MidrollAd" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "linkUrl" TEXT,
    "ctaText" TEXT,
    "skipAfterSeconds" INTEGER NOT NULL DEFAULT 5,
    "triggerType" TEXT NOT NULL DEFAULT 'percentage',
    "triggerValue" DOUBLE PRECISION,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "schoolId" TEXT,
    "sponsorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MidrollAd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdImpression" (
    "id" TEXT NOT NULL,
    "adType" TEXT NOT NULL,
    "prerollAdId" TEXT,
    "midrollAdId" TEXT,
    "sponsorId" TEXT,
    "schoolId" TEXT,
    "videoId" TEXT,
    "guardianId" TEXT,
    "sessionId" TEXT,
    "watchedFull" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skipTime" DOUBLE PRECISION,
    "watchTime" DOUBLE PRECISION,
    "adDuration" DOUBLE PRECISION,
    "reached25" BOOLEAN NOT NULL DEFAULT false,
    "reached50" BOOLEAN NOT NULL DEFAULT false,
    "reached75" BOOLEAN NOT NULL DEFAULT false,
    "reached100" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "deviceType" TEXT,
    "userAgent" TEXT,
    "hourOfDay" INTEGER,
    "dayOfWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "schoolId" TEXT,
    "classId" TEXT,
    "guardianId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "targetType" TEXT NOT NULL DEFAULT 'all',
    "targetId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "School_slug_key" ON "School"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Class_schoolId_slug_key" ON "Class"("schoolId", "slug");

-- CreateIndex
CREATE INDEX "VideoView_videoId_idx" ON "VideoView"("videoId");

-- CreateIndex
CREATE INDEX "VideoView_guardianId_idx" ON "VideoView"("guardianId");

-- CreateIndex
CREATE INDEX "ReactionLog_videoId_idx" ON "ReactionLog"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "StampCard_guardianId_year_key" ON "StampCard"("guardianId", "year");

-- CreateIndex
CREATE INDEX "Sponsor_schoolId_idx" ON "Sponsor"("schoolId");

-- CreateIndex
CREATE INDEX "SponsorImpression_sponsorId_idx" ON "SponsorImpression"("sponsorId");

-- CreateIndex
CREATE INDEX "SponsorImpression_schoolId_idx" ON "SponsorImpression"("schoolId");

-- CreateIndex
CREATE INDEX "SponsorClick_sponsorId_idx" ON "SponsorClick"("sponsorId");

-- CreateIndex
CREATE INDEX "SponsorClick_schoolId_idx" ON "SponsorClick"("schoolId");

-- CreateIndex
CREATE INDEX "SponsorSupport_sponsorId_idx" ON "SponsorSupport"("sponsorId");

-- CreateIndex
CREATE INDEX "SponsorSupport_schoolId_idx" ON "SponsorSupport"("schoolId");

-- CreateIndex
CREATE INDEX "SponsorSupport_guardianId_idx" ON "SponsorSupport"("guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "Guardian"("email");

-- CreateIndex
CREATE INDEX "ChildFace_childId_idx" ON "ChildFace"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianChild_guardianId_childId_key" ON "GuardianChild"("guardianId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildClassroom_childId_classId_key" ON "ChildClassroom"("childId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_guardianId_videoId_key" ON "Favorite"("guardianId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianClassroomSetting_guardianId_classId_key" ON "GuardianClassroomSetting"("guardianId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "VideoFaceTag_videoId_idx" ON "VideoFaceTag"("videoId");

-- CreateIndex
CREATE INDEX "PrerollAd_schoolId_idx" ON "PrerollAd"("schoolId");

-- CreateIndex
CREATE INDEX "PrerollAd_sponsorId_idx" ON "PrerollAd"("sponsorId");

-- CreateIndex
CREATE INDEX "PrerollAd_isActive_idx" ON "PrerollAd"("isActive");

-- CreateIndex
CREATE INDEX "MidrollAd_schoolId_idx" ON "MidrollAd"("schoolId");

-- CreateIndex
CREATE INDEX "MidrollAd_sponsorId_idx" ON "MidrollAd"("sponsorId");

-- CreateIndex
CREATE INDEX "MidrollAd_isActive_idx" ON "MidrollAd"("isActive");

-- CreateIndex
CREATE INDEX "MidrollAd_triggerType_idx" ON "MidrollAd"("triggerType");

-- CreateIndex
CREATE INDEX "AdImpression_adType_idx" ON "AdImpression"("adType");

-- CreateIndex
CREATE INDEX "AdImpression_prerollAdId_idx" ON "AdImpression"("prerollAdId");

-- CreateIndex
CREATE INDEX "AdImpression_midrollAdId_idx" ON "AdImpression"("midrollAdId");

-- CreateIndex
CREATE INDEX "AdImpression_sponsorId_idx" ON "AdImpression"("sponsorId");

-- CreateIndex
CREATE INDEX "AdImpression_schoolId_idx" ON "AdImpression"("schoolId");

-- CreateIndex
CREATE INDEX "AdImpression_videoId_idx" ON "AdImpression"("videoId");

-- CreateIndex
CREATE INDEX "AdImpression_guardianId_idx" ON "AdImpression"("guardianId");

-- CreateIndex
CREATE INDEX "AdImpression_sessionId_idx" ON "AdImpression"("sessionId");

-- CreateIndex
CREATE INDEX "AdImpression_createdAt_idx" ON "AdImpression"("createdAt");

-- CreateIndex
CREATE INDEX "AdImpression_hourOfDay_idx" ON "AdImpression"("hourOfDay");

-- CreateIndex
CREATE INDEX "AdImpression_dayOfWeek_idx" ON "AdImpression"("dayOfWeek");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_schoolId_idx" ON "AnalyticsEvent"("schoolId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_classId_idx" ON "AnalyticsEvent"("classId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_guardianId_idx" ON "AnalyticsEvent"("guardianId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Announcement_schoolId_idx" ON "Announcement"("schoolId");

-- CreateIndex
CREATE INDEX "Announcement_type_idx" ON "Announcement"("type");

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoView" ADD CONSTRAINT "VideoView_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoView" ADD CONSTRAINT "VideoView_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionLog" ADD CONSTRAINT "ReactionLog_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionLog" ADD CONSTRAINT "ReactionLog_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampCard" ADD CONSTRAINT "StampCard_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorImpression" ADD CONSTRAINT "SponsorImpression_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorClick" ADD CONSTRAINT "SponsorClick_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorSupport" ADD CONSTRAINT "SponsorSupport_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildFace" ADD CONSTRAINT "ChildFace_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianChild" ADD CONSTRAINT "GuardianChild_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianChild" ADD CONSTRAINT "GuardianChild_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildClassroom" ADD CONSTRAINT "ChildClassroom_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildClassroom" ADD CONSTRAINT "ChildClassroom_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianClassroomSetting" ADD CONSTRAINT "GuardianClassroomSetting_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianClassroomSetting" ADD CONSTRAINT "GuardianClassroomSetting_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoFaceTag" ADD CONSTRAINT "VideoFaceTag_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoFaceTag" ADD CONSTRAINT "VideoFaceTag_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrerollAd" ADD CONSTRAINT "PrerollAd_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrerollAd" ADD CONSTRAINT "PrerollAd_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidrollAd" ADD CONSTRAINT "MidrollAd_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidrollAd" ADD CONSTRAINT "MidrollAd_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_midrollAdId_fkey" FOREIGN KEY ("midrollAdId") REFERENCES "MidrollAd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_prerollAdId_fkey" FOREIGN KEY ("prerollAdId") REFERENCES "PrerollAd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
