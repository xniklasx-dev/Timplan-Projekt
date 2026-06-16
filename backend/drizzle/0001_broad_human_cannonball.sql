ALTER TABLE "cards" DROP CONSTRAINT "cards_deck_id_decks_id_fk";
--> statement-breakpoint
ALTER TABLE "date_data" DROP CONSTRAINT "date_data_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "decks" DROP CONSTRAINT "decks_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "decks" DROP CONSTRAINT "decks_parent_deck_id_decks_id_fk";
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "date_data" ADD CONSTRAINT "date_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_parent_deck_id_decks_id_fk" FOREIGN KEY ("parent_deck_id") REFERENCES "public"."decks"("id") ON DELETE set null ON UPDATE cascade;