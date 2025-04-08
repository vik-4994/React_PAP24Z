-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessTokenSecret" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OauthTemporal" (
    "oauthToken" TEXT NOT NULL,
    "oauthTokenSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OauthTemporal_pkey" PRIMARY KEY ("oauthToken")
);

-- CreateTable
CREATE TABLE "PreferenceExchange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "currentGroupNumber" INTEGER NOT NULL,
    "desiredGroupNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferenceExchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcceptedExchange" (
    "id" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "student1Id" TEXT NOT NULL,
    "student2Id" TEXT NOT NULL,
    "groupFrom1" INTEGER NOT NULL,
    "groupTo1" INTEGER NOT NULL,
    "groupFrom2" INTEGER NOT NULL,
    "groupTo2" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcceptedExchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "subjects" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Code_code_key" ON "Code"("code");

-- AddForeignKey
ALTER TABLE "PreferenceExchange" ADD CONSTRAINT "PreferenceExchange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptedExchange" ADD CONSTRAINT "AcceptedExchange_student1Id_fkey" FOREIGN KEY ("student1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptedExchange" ADD CONSTRAINT "AcceptedExchange_student2Id_fkey" FOREIGN KEY ("student2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
