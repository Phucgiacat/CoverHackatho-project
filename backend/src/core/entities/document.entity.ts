import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('document')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  originalFilename: string;

  @Column('text')
  markdownFilename: string;

  @Column('text')
  markdownPath: string;

  @Column('integer')
  fileSize: number;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn()
  uploadedAt: Date;
}

