import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import type { DailyQuest } from "./dailyQuests.model.js";

@Entity("user_quests")
@Unique("UQ_user_quests_owner_daily_quest_date", ["owner_id", "daily_quest_id", "quest_date"])
export class UserQuest {
  @PrimaryGeneratedColumn("uuid")
  user_quest_id!: string;

  @Column({ type: "uuid" })
  owner_id!: string

  @ManyToOne("DailyQuest", "user_quests", { onDelete: "CASCADE" })
  @JoinColumn({ name: "daily_quest_id" })
  daily_quest_id!: DailyQuest;

  @Column({ type: "date", nullable: false, default: () => "CURRENT_DATE" })
  quest_date!: string;
  
  @Column({ type: "timestamptz", nullable: true })
  expires_at!: Date | null;

  @Column({ type: "enum", enum: ["pending", "complete", "claimed", "expired"], default: "pending" })
  status!: string;

  @Column({ type: "timestamptz", nullable: true })
  completed_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz", nullable: false })
  created_at!: Date;
}