import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Document } from '../../documents/entities/document.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  role!: string;

  @OneToMany(() => Document, (document) => document.owner)
  documents!: Document[];
}
