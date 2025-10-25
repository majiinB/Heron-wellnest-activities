import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("user_badges")
export class UserBadge {
    @PrimaryColumn("uuid")
    user_badge_id!: string;

    @Column("uuid")
    user_id!: string;

    @Column({ type: "uuid" })
    badge_id!: string;

    @CreateDateColumn({ type: "timestamptz" })
    awarded_at!: Date;
}