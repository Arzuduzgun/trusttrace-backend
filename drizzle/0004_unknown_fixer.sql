CREATE TYPE "public"."rule_action" AS ENUM('FLAG', 'BLOCK');--> statement-breakpoint
CREATE TYPE "public"."rule_match_type" AS ENUM('WORD', 'PHRASE');--> statement-breakpoint
CREATE TABLE "moderation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern" varchar(200) NOT NULL,
	"match_type" "rule_match_type" NOT NULL,
	"action" "rule_action" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "moderation_rules_pattern_unique" UNIQUE("pattern")
);
--> statement-breakpoint
ALTER TABLE "moderation_rules" ADD CONSTRAINT "moderation_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;