import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({ type: "text" })
    question_text!: string;

    @CreateDateColumn({ type: "timestamptz" })
    created_at!: Date;

    @CreateDateColumn({ type: "timestamptz" })
    updated_at!: Date;
}