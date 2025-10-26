import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Badge } from "./badge.model.js";

@Entity("user_badges")
export class UserBadge {
    @PrimaryColumn("uuid")
    user_badge_id!: string;

    @Column("uuid")
    user_id!: string;

    @ManyToOne(() => Badge, { onDelete: "CASCADE" })
    @JoinColumn({ name: "badge_id" })
    badge!: Badge;

    @CreateDateColumn({ type: "timestamptz" })
    awarded_at!: Date;
}