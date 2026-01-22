import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { EncryptedField } from "../../types/encryptedField.type.js";

/**
 * @file journalEntry.model.ts
 * 
 * @description Journal entry model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-11-11
 */

@Entity("journal_entries")
export class JournalEntry {
  @PrimaryGeneratedColumn("uuid")
  journal_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "jsonb" })
  title_encrypted!: EncryptedField;

  @Column({ type: "jsonb" })
  content_encrypted!: EncryptedField;

  @Column({ type: "jsonb", nullable: true })
  wellness_state!: Record<string, number>;

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}