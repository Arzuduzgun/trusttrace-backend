ALTER TABLE "moderation_events" ADD COLUMN "prev_hash" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD COLUMN "hash" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_hash_unique" UNIQUE("hash");