import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import type { UserBadge } from "./userBadge.model.js";

@Entity("badges")
export class Badge {
    @PrimaryColumn("uuid")
    badge_id!: string;

    @OneToMany("UserBadge", "badge")
    userBadges!: UserBadge[];

    @Index({ unique: true })
    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "text", nullable: true })
    icon_url!: string | null;

    @Column({ type: "varchar", length: 100 })
    event_trigger!: string;

    @Column({ type: "int", default: 0 })
    threshold!: number;

    @Column({ type: "varchar", length: 100 })
    condition_type!: string;

    @Column({ type: "int", default: 1 })
    level!: number;
}