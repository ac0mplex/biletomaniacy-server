-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler version: 1.0.0-beta
-- PostgreSQL version: 15.0
-- Project Site: pgmodeler.io
-- Model Author: ---

-- Database creation must be performed outside a multi lined SQL file. 
-- These commands were put in this file only as a convenience.
-- 
-- object: biletomaniacy | type: DATABASE --
-- DROP DATABASE IF EXISTS biletomaniacy;
CREATE DATABASE biletomaniacy
	ENCODING = 'UTF8'
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8';
-- ddl-end --


-- object: public."user" | type: TABLE --
-- DROP TABLE IF EXISTS public."user";
CREATE TABLE public."user" (
	id character(36) NOT NULL,
	name text NOT NULL,
	password text NOT NULL,
	salt text NOT NULL,
	admin boolean NOT NULL DEFAULT False,
	CONSTRAINT user_pk PRIMARY KEY (id),
	CONSTRAINT name_unique UNIQUE (name)
	USING INDEX TABLESPACE pg_default
)
TABLESPACE pg_default;
-- ddl-end --
ALTER TABLE public."user" OWNER TO postgres;
-- ddl-end --

-- object: public.concert | type: TABLE --
-- DROP TABLE IF EXISTS public.concert;
CREATE TABLE public.concert (
	id serial NOT NULL,
	name text NOT NULL,
	location text,
	date timestamp NOT NULL,
	CONSTRAINT concert_pk PRIMARY KEY (id)
)
TABLESPACE pg_default;
-- ddl-end --
ALTER TABLE public.concert OWNER TO postgres;
-- ddl-end --

-- object: public.ticket | type: TABLE --
-- DROP TABLE IF EXISTS public.ticket;
CREATE TABLE public.ticket (
	id serial NOT NULL,
	"row" integer,
	"column" integer,
	payed boolean NOT NULL DEFAULT false,
	concert_id integer NOT NULL,
	user_id character(36),
	CONSTRAINT ticket_pk PRIMARY KEY (id)
)
TABLESPACE pg_default;
-- ddl-end --
ALTER TABLE public.ticket OWNER TO postgres;
-- ddl-end --

-- object: sessions | type: Generic SQL Object --
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
-- ddl-end --

-- object: concert_fk | type: CONSTRAINT --
-- ALTER TABLE public.ticket DROP CONSTRAINT IF EXISTS concert_fk CASCADE;
ALTER TABLE public.ticket ADD CONSTRAINT concert_fk FOREIGN KEY (concert_id)
REFERENCES public.concert (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: user_fk | type: CONSTRAINT --
-- ALTER TABLE public.ticket DROP CONSTRAINT IF EXISTS user_fk CASCADE;
ALTER TABLE public.ticket ADD CONSTRAINT user_fk FOREIGN KEY (user_id)
REFERENCES public."user" (id) MATCH SIMPLE
ON DELETE SET NULL ON UPDATE NO ACTION;
-- ddl-end --


