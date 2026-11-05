ALTER TYPE "public"."message_status" RENAME TO "message_status_old";--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('PENDING', 'DELIVERED', 'FLAGGED', 'BLOCKED', 'FAILED');--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "status" SET DATA TYPE "public"."message_status" USING "status"::text::"public"."message_status";--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "status" SET DEFAULT 'DELIVERED';--> statement-breakpoint
DROP TYPE "public"."message_status_old";