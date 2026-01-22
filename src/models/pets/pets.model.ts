import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm/browser";

@Entity("pets")
export class Pet {
  @PrimaryColumn("uuid")
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

  @Column({ type: "int", default: 100, nullable: false })
  pet_energy!: number;

  @Column({ type: "int", default: 100, nullable: false })
  pet_hunger!: number;

  @Column({ type: "int", default: 100, nullable: false })
  pet_cleanliness!: number;

  @UpdateDateColumn({ type: "timestamptz", nullable: false })
  last_interaction_at!: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", nullable: false })
  created_at!: Date;
}