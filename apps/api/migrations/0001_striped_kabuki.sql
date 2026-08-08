CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"shortlink_id" integer NOT NULL,
	"device" text NOT NULL,
	"country" text DEFAULT 'Unknown' NOT NULL,
	"referrer" text DEFAULT '' NOT NULL,
	"visitor" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shortlinks" ADD COLUMN "campaign_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notification_prefs" jsonb DEFAULT '{"email":{"linkClicks":true,"campaignReports":true,"accountUpdates":true},"push":{"mobileAlerts":true}}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_shortlink_id_shortlinks_id_fk" FOREIGN KEY ("shortlink_id") REFERENCES "public"."shortlinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaigns_user_id_idx" ON "campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clicks_shortlink_id_idx" ON "clicks" USING btree ("shortlink_id");--> statement-breakpoint
CREATE INDEX "clicks_created_at_idx" ON "clicks" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "shortlinks" ADD CONSTRAINT "shortlinks_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shortlinks_user_id_idx" ON "shortlinks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shortlinks_campaign_id_idx" ON "shortlinks" USING btree ("campaign_id");