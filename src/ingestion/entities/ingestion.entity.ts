import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class IngestionProcess {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  documentId!: string;

  @Column()
  status!: string; // 'pending', 'processing', 'completed', 'failed'

  @Column({ nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
