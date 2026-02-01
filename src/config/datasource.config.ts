import { Badge } from "../models/activities/badge.model.js";
import { FlipFeel } from "../models/activities/flipFeel.model.js";
import { FlipFeelChoice } from "../models/activities/flipFeelChoices.model.js";
import { FlipFeelQuestions } from "../models/activities/flipFeelQuestions.model.js";
import { FlipFeelResponse } from "../models/activities/flipFeelResponse.model.js";
import { GratitudeEntry } from "../models/activities/gratitudeEntry.model.js";
import { JournalEntry } from "../models/activities/journalEntry.model.js";
import { MoodCheckIn } from "../models/activities/moodCheckIn.model.js";
import { UserBadge } from "../models/activities/userBadge.model.js";

import { FoodInventory } from "../models/pets/foodInventory.model.js";
import { Pet } from "../models/pets/pets.model.js";
import { PetFood } from "../models/pets/petFood.model.js";
import { PetInteraction } from "../models/pets/petsInteractions.model.js";

import { env } from "./env.config.js";
import { DataSource } from "typeorm";

/**
 * Data source configuration for TypeORM.
 *
 * This module exports the configuration object required to establish a connection
 * to the MySQL database using TypeORM. It utilizes environment variables defined
 * in `env.config.ts` for database connection parameters.
 *
 * @file datasource.config.ts
 * @description Configuration for TypeORM data source.
 * 
 * Usage:
 * - Imported in `app.ts` to initialize the database connection.
 *
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-10-01
 *
 * @see {@link https://typeorm.io/data-source-options}
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [JournalEntry, GratitudeEntry, FlipFeel, 
    FlipFeelChoice, FlipFeelQuestions, FlipFeelResponse, 
    MoodCheckIn, UserBadge, Badge, Pet, PetFood, PetInteraction, FoodInventory],
  ...(env.NODE_ENV === "production" && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
  synchronize: env.NODE_ENV === "development", // Use with caution in production
  // migrations: ["src/migrations/*.ts"],
  logging: ["query", "error"],
})