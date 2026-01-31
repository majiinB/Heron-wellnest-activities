import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("pet_food")
export class PetFood {
  @PrimaryGeneratedColumn("uuid")
  food_id!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  food_name!: string;

  @Column({ type: "int", nullable: false })
  xp_gain!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  food_description!: string | null;

  @Column({ type: "int", nullable: false })
  hunger_fill_amount!: number;

  @Column({ type: "int", nullable: false })
  food_price!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  food_image_url!: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}