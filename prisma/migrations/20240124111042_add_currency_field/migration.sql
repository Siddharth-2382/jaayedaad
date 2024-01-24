/*
  Warnings:

  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "buyCurrency" TEXT NOT NULL DEFAULT 'INR';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
