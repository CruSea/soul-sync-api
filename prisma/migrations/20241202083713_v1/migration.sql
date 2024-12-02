-- CreateTable
CREATE TABLE "Account" (
    "uuid" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Role" (
    "uuid" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'owner',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Channel" (
    "uuid" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Message" (
    "uuid" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "to_address" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "AccountUser" (
    "uuid" TEXT NOT NULL,
    "account_id" TEXT,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "accountName" TEXT,

    CONSTRAINT "AccountUser_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_from_address_fkey" FOREIGN KEY ("from_address") REFERENCES "Account"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_to_address_fkey" FOREIGN KEY ("to_address") REFERENCES "Account"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountUser" ADD CONSTRAINT "AccountUser_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountUser" ADD CONSTRAINT "AccountUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountUser" ADD CONSTRAINT "AccountUser_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
