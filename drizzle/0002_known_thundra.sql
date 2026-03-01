CREATE TYPE "public"."product_status" AS ENUM('Verified', 'Pending', 'Expired');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('Confirmed', 'Pending', 'Failed');--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"batch" varchar(100),
	"stock" integer DEFAULT 0 NOT NULL,
	"status" "product_status" DEFAULT 'Pending' NOT NULL,
	"manufacturer_id" integer,
	"current_owner_id" integer,
	"manufacturing_date" timestamp,
	"expiry_date" timestamp,
	"blockchain_hash" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"action" varchar(100) NOT NULL,
	"from_user_id" integer,
	"to_user_id" integer,
	"tx_hash" varchar(255),
	"block_number" integer,
	"status" "transaction_status" DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_manufacturer_id_users_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_current_owner_id_users_id_fk" FOREIGN KEY ("current_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;