import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { PetFood } from "./petFood.model.js";

@Entity("food_inventory")
@Unique(["owner_id", "food_id"])
export class FoodInventory {
  @PrimaryGeneratedColumn("uuid")
  inventory_id!: string;

  @Column({type: 'uuid', nullable: false})
  owner_id!: string;

  @ManyToOne(() => PetFood)
  @JoinColumn({ name: 'food_id' })
  food_id!: PetFood;

  @Column({ type: 'integer', nullable: false, default: 0 })
  quantity!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  acquired_at!: Date;
}