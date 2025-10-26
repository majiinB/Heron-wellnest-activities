import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("badges")
export class Badge {
    @PrimaryColumn("uuid")
    badge_id!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "text", nullable: true })
    icon_url!: string | null;

    @Column({ type: "string", length: 100 })
    event_trigger!: string;

    @Column({ type: "int", default: 0 })
    threshold!: number;

    @Column({ type: "string", length: 100 })
    condition_type!: string;

    @Column({ type: "int", default: 1 })
    level!: number;
}