CREATE TYPE "public"."card_rating" AS ENUM('again', 'hard', 'good', 'easy');--> statement-breakpoint
CREATE TYPE "public"."card_state" AS ENUM('new', 'learning', 'review', 'suspended');--> statement-breakpoint
CREATE TABLE "card_progress" (
	"card_id" uuid PRIMARY KEY NOT NULL,
	"state" "card_state" DEFAULT 'new' NOT NULL,
	"due" timestamp with time zone DEFAULT now() NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_id" uuid NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"hint" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "date_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date DEFAULT date(now()) NOT NULL,
	"easy" bigint DEFAULT 0 NOT NULL,
	"medium" bigint DEFAULT 0 NOT NULL,
	"hard" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_deck_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"tags" text[],
	"color" text,
	"icon" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_progress" ADD CONSTRAINT "card_progress_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "date_data" ADD CONSTRAINT "date_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_parent_deck_id_decks_id_fk" FOREIGN KEY ("parent_deck_id") REFERENCES "public"."decks"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "card_progress_due_idx" ON "card_progress" USING btree ("due");--> statement-breakpoint
CREATE INDEX "card_progress_state_due_idx" ON "card_progress" USING btree ("state","due");--> statement-breakpoint
CREATE INDEX "cards_deck_id_created_at_idx" ON "cards" USING btree ("deck_id","created_at");--> statement-breakpoint
CREATE INDEX "cards_tags_idx" ON "cards" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "date_data_user_id_date_unique" ON "date_data" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "date_data_user_id_idx" ON "date_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decks_user_id_idx" ON "decks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decks_parent_deck_id_idx" ON "decks" USING btree ("parent_deck_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");