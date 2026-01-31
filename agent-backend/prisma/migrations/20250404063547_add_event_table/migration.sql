-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "eventSourceId" UUID NOT NULL,
    "eventTypeId" UUID NOT NULL,
    "reference" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
