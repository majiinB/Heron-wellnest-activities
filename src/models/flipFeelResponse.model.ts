import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FlipFeelQuestions } from "./flipFeelQuestions.model.js";
import { FlipFeelChoice } from "./flipFeelChoices.model.js";
import { FlipFeel } from "./flipFeel.model.js";

/**
 * @file flipFeelResponse.model.ts
 * 
 * @description Flip and feel response model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-21
 */

@Entity("flip_feel_responses")
export class FlipFeelResponse {
  @PrimaryGeneratedColumn("uuid")
  response_id!: string;

  @ManyToOne(()=> FlipFeel, {onDelete: "CASCADE"})
  flip_feel_id!: FlipFeel;

  @ManyToOne(()=> FlipFeelQuestions, {onDelete: "CASCADE"})
  @JoinColumn({name: "question_id"})
  question_id!: FlipFeelQuestions;

  @ManyToOne(()=> FlipFeelChoice, {onDelete: "CASCADE"})
  @JoinColumn({name: "choice_id"})
  choice_id!: FlipFeelChoice;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}