CREATE TYPE "public"."moderation_actor_type" AS ENUM('SYSTEM', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."moderation_event_type" AS ENUM('VIOLATION_DETECTED', 'SANCTION_IMPOSED', 'SANCTION_REVOKED');--> statement-breakpoint
CREATE TABLE "moderation_events" (
	"seq" bigserial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "moderation_event_type" NOT NULL,
	"actor_type" "moderation_actor_type" NOT NULL,
	"actor_id" uuid,
	"subject_user_id" uuid NOT NULL,
	"room_id" uuid,
	"message_id" uuid,
	"refers_to_event_id" uuid,
	"payload" jsonb NOT NULL,
	"trace_id" varchar(64),
	"occurred_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "moderation_events_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_subject_user_id_users_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moderation_events_subject_idx" ON "moderation_events" USING btree ("subject_user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "moderation_events_type_idx" ON "moderation_events" USING btree ("event_type","occurred_at");