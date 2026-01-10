/*
  Warnings:

  - You are about to drop the `ExtractedDataVersion` table. If the table is not empty, all the data it contains will be lost.

*/

-- DropForeignKey
ALTER TABLE "ExtractedDataVersion" DROP CONSTRAINT "ExtractedDataVersion_brandProfileId_fkey";

-- DropTable
DROP TABLE "ExtractedDataVersion";
