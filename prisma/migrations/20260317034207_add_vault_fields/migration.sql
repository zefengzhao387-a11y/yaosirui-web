-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "ciphertext" TEXT,
ADD COLUMN     "encrypted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "iv" TEXT,
ADD COLUMN     "salt" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vaultPasswordHash" TEXT,
ADD COLUMN     "vaultSalt" TEXT;
