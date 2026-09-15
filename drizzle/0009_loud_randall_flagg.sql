DROP INDEX `idx_website_verification_submission`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_website_verification_submission_once` ON `website_verifications` (`submission_id`);