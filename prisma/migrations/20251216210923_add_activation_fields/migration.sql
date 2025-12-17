-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activation_token" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;
