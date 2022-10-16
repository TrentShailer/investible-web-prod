CREATE TABLE "player" (
	"id" UUID PRIMARY KEY NOT NULL,
	"name" TEXT,
	"first_name" TEXT,
	"last_name" TEXT,
	"email" TEXT UNIQUE,
	"mobile" TEXT UNIQUE,
	"clicked_contact" BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE "game" (
	"id" UUID PRIMARY KEY NOT NULL,
	"player_id" UUID REFERENCES "player"("id") ON DELETE CASCADE,
	"game_version" VARCHAR,
	"game_end_reason" INT,
	"game_time" FLOAT,
	"positive_event_count" INT,
	"negative_event_count" INT,
	"portfolio_value" INT,
	"insurance_count" INT,
	"low_risk_count" INT,
	"high_risk_count" INT,
	"turns" INT,
	"timestamp" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "device" (
	"id" UUID PRIMARY KEY NOT NULL,
	"mobile" BOOLEAN NOT NULL,
	"player_id" UUID REFERENCES "player"("id") ON DELETE CASCADE
);

CREATE TABLE "leaderboard" (
	"id" UUID PRIMARY KEY NOT NULL,
	"player_id" UUID NOT NULL REFERENCES "player"("id") ON DELETE CASCADE,
	"game_id" UUID NOT NULL REFERENCES "game"("id") ON DELETE CASCADE,
	"agree_terms" BOOLEAN DEFAULT FALSE,
	"timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "competition" (
	"id" UUID PRIMARY KEY NOT NULL,
	"title" VARCHAR NOT NULL,
	"start_date" TIMESTAMPTZ NOT NULL,
	"end_date" TIMESTAMPTZ NOT NULL,
	"details" VARCHAR NOT NULL
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
