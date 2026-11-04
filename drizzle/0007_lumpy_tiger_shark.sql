ALTER TYPE "public"."message_status" ADD VALUE 'PENDING' BEFORE 'DELIVERED';--> statement-breakpoint
ALTER TYPE "public"."message_status" ADD VALUE 'FAILED';