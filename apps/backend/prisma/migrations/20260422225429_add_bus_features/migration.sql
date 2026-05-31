-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "currentRoute" TEXT,
ADD COLUMN     "driver" TEXT,
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Standard';
