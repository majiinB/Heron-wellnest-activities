import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * @file user.model.ts
 * 
 * @description `Abstract` base model for `User` in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */

@Entity("journal_entries")
export class JournalEntry {
  @PrimaryGeneratedColumn("uuid")
  journal_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "text" })
  content_encrypted!: string;

  @Column({ type: "jsonb", nullable: true })
  mood!: Record<string, number>;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;
}