-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "global";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "project";

-- CreateTable
CREATE TABLE "project"."Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "address" TEXT,
    "link" TEXT,
    "debutAt" TIMESTAMP(3) NOT NULL,
    "finAt" TIMESTAMP(3) NOT NULL,
    "fullDay" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "typeEvent" TEXT DEFAULT '1 fois',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project"."UserParrams" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '1',
    "color" TEXT NOT NULL DEFAULT '#ffffff',

    CONSTRAINT "UserParrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project"."Grade" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "listDroit" TEXT,
    "societeId" TEXT NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project"."Droit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent" TEXT,

    CONSTRAINT "Droit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project"."Societe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "listChildren" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Societe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global"."User" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "email" TEXT,
    "verifiedEmail" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT,
    "dateValidToken" TIMESTAMP(3),
    "password" TEXT,
    "tempPassword" TEXT NOT NULL,
    "exterieur" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserParrams_userId_key" ON "project"."UserParrams"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Societe_name_key" ON "project"."Societe"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "global"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "global"."User"("email");
