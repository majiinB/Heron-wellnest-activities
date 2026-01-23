import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("decor_items")
export class DecorItem {
  @PrimaryGeneratedColumn("uuid")
  decor_id!: string;
  
  @Column({ type: "varchar", length: 100, nullable: false })
  decor_name!: string;

  @Column({ type:"enum", enum: ['clock', 'chair', 'desk', 'wallpaper', 'tiles'], nullable: false })
  decor_type!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  decor_description!: string | null;

  @Column({ type: "varchar", length: 255, nullable: false })
  decor_image_url!: string;

  @Column({ type: "int", nullable: false })
  decor_price!: number;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}