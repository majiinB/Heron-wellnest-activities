import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { EncryptedField } from "../types/encryptedField.type.js";

/**
 * @file gratitudeEntry.model.ts
 * 
 * @description Gratitude jar entry model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-10-02
 */

@Entity("gratitude_entries")
export class GratitudeEntry {
  @PrimaryGeneratedColumn("uuid")
  gratitude_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "jsonb" })
  content_encrypted!: EncryptedField;

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}