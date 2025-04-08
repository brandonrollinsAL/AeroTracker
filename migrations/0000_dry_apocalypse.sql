CREATE TABLE "aircraft" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration" text NOT NULL,
	"type" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"variant" text,
	"airline" text,
	"manufacturer_serial_number" text,
	"age" real,
	"category" text,
	"details" json,
	CONSTRAINT "aircraft_registration_unique" UNIQUE("registration")
);
--> statement-breakpoint
CREATE TABLE "airports" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"elevation" integer,
	"size" text,
	"type" text,
	"time_zone" text,
	"details" json,
	CONSTRAINT "airports_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"flight_id" integer,
	"type" text NOT NULL,
	"message" text,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flights" (
	"id" serial PRIMARY KEY NOT NULL,
	"flight_number" text NOT NULL,
	"airline" text NOT NULL,
	"aircraft_type" text,
	"aircraft_registration" text,
	"departure_airport" text NOT NULL,
	"arrival_airport" text NOT NULL,
	"departure_time" timestamp NOT NULL,
	"arrival_time" timestamp NOT NULL,
	"status" text,
	"latitude" real,
	"longitude" real,
	"altitude" integer,
	"heading" integer,
	"ground_speed" integer,
	"vertical_speed" integer,
	"squawk" text,
	"last_updated" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"preferences" json,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE no action ON UPDATE no action;