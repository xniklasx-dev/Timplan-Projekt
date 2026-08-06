ALTER TABLE "decks" ADD COLUMN "last_studied" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "decks" DROP COLUMN "icon";