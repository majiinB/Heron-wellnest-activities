import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { FlipFeelQuestions } from "./flipFeelQuestions.model.js";
import type { FlipFeelChoice } from "./flipFeelChoices.model.js";
import type { FlipFeel } from "./flipFeel.model.js";

/**
 * @file flipFeelResponse.model.ts
 * 
 * @description Flip and feel response model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-11-11
 */

@Entity("flip_feel_responses")
export class FlipFeelResponse {
  @PrimaryGeneratedColumn("uuid")
  response_id!: string;

  @ManyToOne("FlipFeel", "responses", { onDelete: "CASCADE" })
  @JoinColumn({ name: "flip_feel_id" })
  flip_feel_id!: FlipFeel;

  @ManyToOne("FlipFeelQuestions", "responses", { onDelete: "CASCADE" })
  @JoinColumn({ name: "question_id" })
  question_id!: FlipFeelQuestions;

  @ManyToOne("FlipFeelChoice", "responses", { onDelete: "CASCADE" })
  @JoinColumn({ name: "choice_id" })
  choice_id!: FlipFeelChoice;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}