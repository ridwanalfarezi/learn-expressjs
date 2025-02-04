/*
  Warnings:

  - Made the column `user_id` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `token` on table `Token` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "token" SET NOT NULL;
