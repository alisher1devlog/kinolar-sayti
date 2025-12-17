/*
  Warnings:

  - You are about to drop the column `created_at` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "created_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
