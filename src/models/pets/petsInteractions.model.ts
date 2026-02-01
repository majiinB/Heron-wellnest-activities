import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("pets_interactions")
export class PetInteraction {
  @PrimaryGeneratedColumn("uuid")
  interaction_id!: string;

  @ManyToOne("Pet", "pet_interactions", { onDelete: "CASCADE" })
  @JoinColumn({ name: "pet_id" })
  pet_id!: string;

  @Column({ type: "enum", enum: ["feed", "clean", "play", "pet", "sleep"], nullable: false })
  interaction_type!: string;

  @CreateDateColumn({ type: "timestamptz" })
  timestamp!: Date;
}