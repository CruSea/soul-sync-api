-- CreateTable
CREATE TABLE "Account" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "User" (
    "uuid" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Role" (
    "uuid" UUID NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "AccountUser" (
    "uuid" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "AccountUser_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Mentor" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "expertise" TEXT,
    "accountUserId" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "availableFrom" TEXT,
    "availableTo" TEXT,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Channel" (
    "uuid" UUID NOT NULL,
    "accountId" UUID,
    "name" VARCHAR(255) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Thread" (
    "uuid" UUID NOT NULL,
    "channelId" UUID,
    "title" VARCHAR(255) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "mentorId" UUID,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Message" (
    "uuid" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "fromAddress" VARCHAR(255) NOT NULL,
    "toAddress" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "AccountUser" ADD CONSTRAINT "AccountUser_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountUser" ADD CONSTRAINT "AccountUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountUser" ADD CONSTRAINT "AccountUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_accountUserId_fkey" FOREIGN KEY ("accountUserId") REFERENCES "AccountUser"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
