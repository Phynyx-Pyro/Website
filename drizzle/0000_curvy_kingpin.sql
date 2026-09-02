CREATE TABLE `growth_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`business_name` text NOT NULL,
	`industry` text NOT NULL,
	`annual_revenue` text,
	`biggest_challenge` text,
	`current_marketing` text,
	`monthly_budget` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_growth_assessments_created_at` ON `growth_assessments` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_growth_assessments_email` ON `growth_assessments` (`email`);--> statement-breakpoint
CREATE TABLE `support_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_support_requests_created_at` ON `support_requests` (`created_at`);