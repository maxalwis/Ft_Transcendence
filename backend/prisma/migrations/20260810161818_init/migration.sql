-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_tiger_geocoder";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "coverUrl" TEXT,
    "addressName" TEXT,
    "addressStreet" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location" geography(Point, 4326),
    "priceType" TEXT,
    "priceDetail" TEXT,
    "accessLink" TEXT,
    "category" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audience" TEXT,
    "rank" DOUBLE PRECISION,
    "weight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_source_externalId_key" ON "Event"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
