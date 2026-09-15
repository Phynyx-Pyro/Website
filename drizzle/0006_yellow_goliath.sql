ALTER TABLE `growth_assessments` ADD `submission_snapshot` text;--> statement-breakpoint
ALTER TABLE `growth_assessments` ADD `journey_state` text;--> statement-breakpoint
ALTER TABLE `growth_assessments` ADD `recovery_state` text;--> statement-breakpoint
CREATE INDEX `idx_growth_assessments_recovery_journey` ON `growth_assessments` (`recovery_state`,`journey_state`);