import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { FlipFeelQuestions } from "./flipFeelQuestions.model.js";

/**
 * @file flipFeelChoices.model.ts
 * 
 * @description Flip and feel choices model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-21
 */

@Entity("flip_feel_choices")
export class FlipFeelChoice {
  @PrimaryGeneratedColumn("uuid")
  choice_id!: string;

  @ManyToOne("FlipFeelQuestions", "choices", { onDelete: "CASCADE" })
  @JoinColumn({name: "question_id"})
  question_id!: FlipFeelQuestions;

  @Column({ type: "text" })
  choice_text!: string;

  @Column({ type: "text" })
  mood_label!: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}