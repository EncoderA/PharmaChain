ALTER TYPE "public"."user_role" ADD VALUE 'wholesaler' BEFORE 'admin';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "on_chain_drug_id" integer;