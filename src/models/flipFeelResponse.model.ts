import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FlipFeelQuestions } from "./flipFeelQuestions.model.js";

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
export class FlipFeelChoice {
  @PrimaryGeneratedColumn("uuid")
  response_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @ManyToOne(()=> FlipFeelQuestions, {onDelete: "CASCADE"})
  @JoinColumn({name: "question_id"})
  question_id!: FlipFeelQuestions;

  @ManyToOne(()=> FlipFeelChoice, {onDelete: "CASCADE"})
  @JoinColumn({name: "choice_id"})
  choice_id!: FlipFeelChoice;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}