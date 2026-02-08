import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_quests")
export class UserQuest {
  @PrimaryGeneratedColumn("uuid")
  user_quest_id!: string;

  @Column({ type: "uuid" })
  owner_id!: string

  @Column({ type: "enum", enum: ["pending", "complete", "claimed", "expired"], default: "pending" })
  status!: string;

  @Column({ type: "timestamptz", nullable: true })
  completed_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz", nullable: false })
  created_at!: Date;
}