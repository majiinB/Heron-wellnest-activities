import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm/browser";
import { PetInteraction } from "./petsInteractions.model.js";

@Entity("pets")
export class Pet {
  @PrimaryGeneratedColumn("uuid")
  pet_id!: string;

  @Column({ type: "uuid", unique: true, nullable: false })
  owner_id!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 100, default: "heron",nullable: false })
  species!: string

  @Column({ type: "int", default: 1, nullable: false })
  level!: number;

  @Column({ type: "int", default: 0, nullable: false })
  experience!: number;
  
  @Column({type: "enum", enum: ["infant", "teen", "adult"], default: "infant", nullable: false })
  age_stage!: string;

  @Column({type: "enum", enum: ["excited", "sad", "puppy_eyes", "frustrated", "sleepy"], default: "excited", nullable: false   })
  pet_mood!: string;

  @Column({ type: "int", default: 500, nullable: false })
  pet_coin!: number;

  @Column({ type: "int", default: 100, nullable: false })
  pet_energy!: number;

  @Column({ type: "int", default: 100, nullable: false })
  pet_hunger!: number;

  @Column({ type: "int", default: 100, nullable: false })
  pet_cleanliness!: number;

  @Column({ type: "int", default: 100, nullable: false })
  pet_happiness!: number;

  @UpdateDateColumn({ type: "timestamptz", nullable: false })
  last_interaction_at!: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", nullable: false })
  created_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  sleep_until!: Date | null;

  @OneToMany(() => PetInteraction, (interaction) => interaction.pet_id)
  pet_interactions!: PetInteraction[];
}