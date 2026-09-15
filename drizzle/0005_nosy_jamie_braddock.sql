CREATE TABLE `intake_contact_grants` (
	`session_hash` text NOT NULL,
	`location_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	PRIMARY KEY(`session_hash`, `location_id`, `contact_id`),
	FOREIGN KEY (`session_hash`) REFERENCES `intake_sessions`(`token_hash`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `intake_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_intake_sessions_expires_at` ON `intake_sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `booking_handoffs` ADD `intake_session_hash` text;--> statement-breakpoint
ALTER TABLE `growth_assessments` ADD `intake_session_hash` text;