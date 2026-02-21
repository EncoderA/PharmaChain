CREATE TYPE "public"."user_role" AS ENUM('manufacturer', 'distributor', 'pharmacist', 'reseller', 'wholesaler', 'consumer');--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fullName" varchar(255) NOT NULL,
	"organization" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(12) NOT NULL,
	"role" "user_role" NOT NULL,
	"walletId" varchar(50) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
