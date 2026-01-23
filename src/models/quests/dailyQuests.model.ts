import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuestDefinition } from "./questDefinitions.js";

@Entity("daily_quests")
export class DailyQuest {
  @PrimaryGeneratedColumn("uuid")
  daily_quest_id!: string;

  @ManyToOne("QuestDefinition", "daily_quests", { onDelete: "CASCADE" })
  @JoinColumn({ name: "quest_definition_id" })
  quest_definition_id!: QuestDefinition;

  @Column({type: "enum", enum: ["global", "personalized"], nullable: false})
  scope!: string;

  @Column({ type: "uuid", nullable: true })
  target_user_id!: string | null;

  @CreateDateColumn({ type: "timestamptz", nullable: false })
  timestamp!: Date;
}