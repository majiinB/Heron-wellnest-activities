import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { DecorItem } from "./decorItems.model.js";

@Entity("decor_inventory")
@Unique(["owner_id", "decor_item"])
export class DecorInventory {
  @PrimaryGeneratedColumn("uuid")
  inventory_id!: string;

  @Column({ type: "uuid", nullable: false })
  owner_id!: string;

  @ManyToOne(() => DecorItem, { onDelete: "CASCADE" })
  @JoinColumn({ name: "decor_id" })
  decor_item!: DecorItem;

  @Column({ type: "boolean", nullable: false })
  is_equipped!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  acquired_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}
