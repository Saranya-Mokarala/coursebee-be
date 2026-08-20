CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" varchar(50),
	"title" varchar(255) NOT NULL,
	"start_date" varchar(50),
	"end_date" varchar(50),
	"address" text,
	"city" varchar(100),
	"zip_postal_code" varchar(20),
	"email" varchar(255),
	"phones" jsonb DEFAULT '[]',
	"teachers" jsonb DEFAULT '[]',
	"course_fee" numeric(10, 2),
	"currency" varchar(10),
	"short_description" text,
	"course_timings" text,
	"img" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
