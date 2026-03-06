CREATE TABLE `site_cache` (
	`host` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`icon_file` text,
	`bg_color` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
