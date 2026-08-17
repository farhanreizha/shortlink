DROP INDEX "notifications_user_seed_type_idx";--> statement-breakpoint
ALTER TABLE "shortlinks" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "shortlinks" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "shortlinks" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "shortlinks" ADD COLUMN "description" text;--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_user_seed_type_idx" ON "notifications" USING btree ("user_id","type") WHERE "notifications"."type" IN ('welcome', 'new_feature');