import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import type { Badge } from "./badge.model.js";

@Entity("user_badges")
export class UserBadge {
    @PrimaryColumn("uuid")
    user_badge_id!: string;

    @Column("uuid")
    user_id!: string;

    @ManyToOne("Badge", "userBadges", { onDelete: "CASCADE" })
    @JoinColumn({ name: "badge_id" })
    badge!: Badge;

    @CreateDateColumn({ type: "timestamptz" })
    awarded_at!: Date;
}