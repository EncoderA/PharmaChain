CREATE TABLE "consumer_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer,
	"product_id" integer NOT NULL,
	"pharmacist_id" integer NOT NULL,
	"consumer_name" varchar(255) NOT NULL,
	"consumer_phone" varchar(15),
	"consumer_address" varchar(500),
	"quantity" integer DEFAULT 1 NOT NULL,
	"sold_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consumer_sales" ADD CONSTRAINT "consumer_sales_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_sales" ADD CONSTRAINT "consumer_sales_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_sales" ADD CONSTRAINT "consumer_sales_pharmacist_id_users_id_fk" FOREIGN KEY ("pharmacist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;