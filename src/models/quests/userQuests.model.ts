import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { DailyQuest } from "./dailyQuests.model.js";

@Entity("user_quests")
export class UserQuest {
  @PrimaryGeneratedColumn("uuid")
  user_quest_id!: string;

  @Column({ type: "uuid" })
  owner_id!: string

  @ManyToOne("DailyQuest", "user_quests", { onDelete: "CASCADE" })
  @JoinColumn({ name: "daily_quest_id" })
  daily_quest_id!: DailyQuest;
  
  @Column({ type: "timestamptz", nullable: true })
  expires_at!: Date | null;

  @Column({ type: "enum", enum: ["pending", "complete", "claimed", "expired"], default: "pending" })
  status!: string;

  @Column({ type: "timestamptz", nullable: true })
  completed_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz", nullable: false })
  created_at!: Date;
}