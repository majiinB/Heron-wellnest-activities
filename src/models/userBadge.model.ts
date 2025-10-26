import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn } from "typeorm";

@Entity("user_badges")
export class UserBadge {
    @PrimaryColumn("uuid")
    user_badge_id!: string;

    @Column("uuid")
    user_id!: string;

    @ManyToOne("Badge", { onDelete: "CASCADE" })
    @Column({ type: "uuid" })
    badge_id!: string;

    @CreateDateColumn({ type: "timestamptz" })
    awarded_at!: Date;
}