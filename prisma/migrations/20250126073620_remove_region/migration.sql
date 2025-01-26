/*
  Warnings:

  - You are about to drop the column `region` on the `ShippingCost` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ShippingCost_region_key";

-- AlterTable
ALTER TABLE "ShippingCost" DROP COLUMN "region";
