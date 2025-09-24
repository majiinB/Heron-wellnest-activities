import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * @file journalEntry.model.ts
 * 
 * @description Journal entry model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-21
 */

@Entity("journal_entries")
export class JournalEntry {
  @PrimaryGeneratedColumn("uuid")
  journal_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column({ type: "jsonb" })
  title_encrypted!: {
    iv: string;
    content: string;
    tag: string;
  };

  @Column({ type: "jsonb" })
  content_encrypted!: {
    iv: string;
    content: string;
    tag: string;
  };

  @Column({ type: "jsonb", nullable: true })
  mood!: Record<string, number>;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;
}