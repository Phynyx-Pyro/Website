CREATE TABLE `website_verifications` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`request_session_hash` text NOT NULL,
	`contact_id` text NOT NULL,
	`location_id` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`state` text NOT NULL,
	`message_id` text,
	`claimed_session_hash` text,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_website_verification_submission` ON `website_verifications` (`submission_id`);