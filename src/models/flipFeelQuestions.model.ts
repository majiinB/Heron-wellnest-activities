import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FlipFeelChoice } from "./flipFeelChoices.model.js";

/**
 * @file flipFeelQuestions.model.ts
 * 
 * @description Flip and feel questions model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-21
 * @updated 2025-09-21
 */

@Entity("flip_feel_questions")
export class FlipFeelQuestions {
    @PrimaryGeneratedColumn("uuid")
    question_id!: string;

    @Index({ unique: true })
    @Column({ type: "text" })
    question_text!: string;

    @Column({ type: "enum", enum: ["school", "opposite_sex", "peers", "family", "crises", "emotions", "recreation"] })
    category!: string;

    @OneToMany(() => FlipFeelChoice, (choice) => choice.question_id)
    choices!: FlipFeelChoice[];

    @CreateDateColumn({ type: "timestamptz" })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updated_at!: Date;
}