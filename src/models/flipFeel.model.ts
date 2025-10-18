import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * @file flipFeelQuestions.model.ts
 * 
 * @description Flip and feel model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-18
 * @updated 2025-10-18
 */

@Entity("flip_feel")
export class FlipFeel {
    @PrimaryGeneratedColumn("uuid")
    flip_feel_id!: string;

    @Column({ type: "uuid" })
    user_id!: string;

    @CreateDateColumn({ type: "timestamptz", nullable: true })
    started_at!: Date | null;

    @CreateDateColumn({ type: "timestamptz", nullable: true })
    finished_at!: Date | null;
}