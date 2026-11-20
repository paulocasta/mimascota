CREATE TABLE `appetite_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`date` text NOT NULL,
	`appetite` text,
	`thirst` text,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `checkups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`date` text NOT NULL,
	`vet_id` integer,
	`reason` text,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vet_id`) REFERENCES `vets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `dewormings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`type` text NOT NULL,
	`product` text NOT NULL,
	`date_applied` text NOT NULL,
	`next_due` text,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `diet` (
	`pet_id` integer PRIMARY KEY NOT NULL,
	`food` text,
	`daily_amount` text,
	`treats` text,
	`table_scraps` text,
	`water_notes` text,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`pet_id` integer PRIMARY KEY NOT NULL,
	`lives_with_animals` integer DEFAULT false NOT NULL,
	`other_animals` text,
	`travels` integer DEFAULT false NOT NULL,
	`daycare` integer DEFAULT false NOT NULL,
	`stool_notes` text,
	`urine_notes` text,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lab_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`date` text NOT NULL,
	`test_name` text NOT NULL,
	`summary` text,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medical_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` integer NOT NULL,
	`name` text NOT NULL,
	`species` text NOT NULL,
	`breed` text,
	`sex` text,
	`birth_date` text,
	`birth_date_is_estimate` integer DEFAULT false NOT NULL,
	`reproductive_status` text,
	`size` text,
	`weight_kg` real,
	`microchip` text,
	`primary_vet_id` integer,
	`photo_path` text,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`primary_vet_id`) REFERENCES `vets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `symptoms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`symptom` text NOT NULL,
	`started_at` text NOT NULL,
	`duration` text,
	`worsening` integer DEFAULT false NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `treatments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`dose` text,
	`schedule` text,
	`start_date` text,
	`end_date` text,
	`active` integer DEFAULT true NOT NULL,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vaccinations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pet_id` integer NOT NULL,
	`name` text NOT NULL,
	`date_applied` text NOT NULL,
	`next_due` text,
	`lot` text,
	`vet_id` integer,
	`notes` text,
	FOREIGN KEY (`pet_id`) REFERENCES `pets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vet_id`) REFERENCES `vets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `vets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` integer NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`clinic` text,
	`license_number` text,
	`phone` text,
	`email` text,
	`address` text,
	`is_emergency` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
