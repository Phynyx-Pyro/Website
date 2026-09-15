CREATE TABLE `website_created_identities` (
	`key` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_dispatch_locks` (
	`key` text PRIMARY KEY NOT NULL,
	`receipt_key` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_dispatch_receipts` (
	`key` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`stage` text NOT NULL,
	`channel` text NOT NULL,
	`location_id` text NOT NULL,
	`contact_id` text,
	`opportunity_id` text,
	`state` text NOT NULL,
	`detail` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_website_dispatch_submission` ON `website_dispatch_receipts` (`submission_id`);