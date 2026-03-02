CREATE TYPE "public"."user_status" AS ENUM('active', 'pending', 'rejected');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "manufacturer_id" integer;