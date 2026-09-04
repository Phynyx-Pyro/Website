CREATE TABLE `booking_handoffs` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`claimed_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_booking_handoffs_submission_id` ON `booking_handoffs` (`submission_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_handoffs_expires_at` ON `booking_handoffs` (`expires_at`);--> statement-breakpoint
CREATE TABLE `public_form_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_public_form_rate_limits_expires_at` ON `public_form_rate_limits` (`expires_at`);--> statement-breakpoint
ALTER TABLE `growth_assessments` ADD `payload_hash` text;--> statement-breakpoint
ALTER TABLE `growth_assessments` ADD `ghl_contact_id` text;--> statement-breakpoint
ALTER TABLE `support_requests` ADD `payload_hash` text;