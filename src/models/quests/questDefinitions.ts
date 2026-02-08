import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("quest_definitions")
export class QuestDefinition {
  @PrimaryGeneratedColumn("uuid")
  quest_definition_id!: string;

  @Column({ type: "varchar", length: 100, unique: true, nullable: false })
  name!: string;

  @Column({ type: "text", length: 500, nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 1, nullable: false })
  reward_money!: number;

  @Column({ type: "int", default: 10, nullable: false })
  reward_experience!: number;

  @Column({ type: "int", default: 5, nullable: true })
  hunger_recovery!: number;

  @Column({ type: "uuid", nullable: true })
  reward_food_id!: string;
  
  @Column({ type: "enum", enum: ["well-being", "pet-care", "pet-interaction"], nullable: true })
  quest_tag!: string;

  @Column({ type: "boolean", default: true, nullable: false })
  is_active!: boolean;

  @CreateDateColumn({ type: "timestamptz", nullable: false })
  created_at!: Date;
}