import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { DecorItem } from "./decorItems.model.js";

@Entity("decor_inventory")
@Unique(["owner_id", "decor_id"])
export class DecorInventory {
  @PrimaryGeneratedColumn("uuid")
  inventory_id!: string;

  @Column({ type: "uuid", nullable: false})
  owner_id!: string;

  @ManyToOne(() => DecorItem)
  @JoinColumn({ name: "decor_id" })
  decor_id!: DecorItem;

  @Column({ type: "boolean", nullable: false })
  is_equipped!: boolean;

  @CreateDateColumn({ type: "timestamptz" })  
  acquired_at!: Date;
}
