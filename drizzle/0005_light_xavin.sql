CREATE TABLE "supply_chain_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"supply_from" integer NOT NULL,
	"supply_to" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "supply_chain_relations" ADD CONSTRAINT "supply_chain_relations_supply_from_users_id_fk" FOREIGN KEY ("supply_from") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_chain_relations" ADD CONSTRAINT "supply_chain_relations_supply_to_users_id_fk" FOREIGN KEY ("supply_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "manufacturer_id";