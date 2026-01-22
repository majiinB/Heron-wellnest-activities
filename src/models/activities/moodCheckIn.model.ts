import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Represents a mood check-in entry for a user.
 *
 * @remarks
 * This entity maps to the `mood_check_ins` table in the database and stores information
 * about a user's mood check-in, including up to three moods and the timestamp of the check-in.
 *
 * @property check_in_id - The unique identifier for the mood check-in (UUID).
 * @property user_id - The unique identifier of the user who performed the check-in (UUID).
 * @property mood_1 - The primary mood selected by the user (required, max 50 characters).
 * @property mood_2 - An optional secondary mood selected by the user (max 50 characters).
 * @property mood_3 - An optional tertiary mood selected by the user (max 50 characters).
 * @property checked_in_at - The timestamp when the check-in was created (defaults to current time).
 * 
 * @file moodCheckIn.model.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-01
 * @updated 2025-10-01
 */
@Entity("mood_check_ins")
export class MoodCheckIn {
  @PrimaryGeneratedColumn("uuid")
  check_in_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({type: "varchar", length: 50, nullable: false})
  mood_1!: string;

  @Column({type: "varchar", length: 50, nullable: true})
  mood_2!: string | null;

  @Column({type: "varchar", length: 50, nullable: true})
  mood_3!: string | null;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  checked_in_at!: Date;
}