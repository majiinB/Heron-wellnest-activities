import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * @file gratitudeEntry.model.ts
 * 
 * @description Gratitude jar entry model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-21
 */

@Entity("gratitude_entries")
export class GratitudeEntry {
  @PrimaryGeneratedColumn("uuid")
  gratitude_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "jsonb" })
  content_encrypted!: {
    iv: string;
    content: string;
    tag: string;
  };

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;
}