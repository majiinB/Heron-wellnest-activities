import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FlipFeelResponse } from "./flipFeelResponse.model.js";

/**
 * @file flipFeel.model.ts
 * 
 * @description Flip and feel model for the Heron Wellnest Activities API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-18
 * @updated 2025-10-26
 */

@Entity("flip_feel")
export class FlipFeel {
    @PrimaryGeneratedColumn("uuid")
    flip_feel_id!: string;

    @Column({ type: "uuid" })
    user_id!: string;

    @OneToMany(() => FlipFeelResponse, (response) => response.flip_feel_id)
    responses!: FlipFeelResponse[];

    @CreateDateColumn({ type: "timestamptz", nullable: true })
    started_at!: Date | null;

    @UpdateDateColumn({ type: "timestamptz", nullable: true })
    finished_at!: Date | null;
}