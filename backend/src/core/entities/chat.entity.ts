import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Message } from "./message.entity";

export enum Phase {
  SUMMARY = 'SUMMARY',
  QUERY = 'QUERY',
  PLAN = 'PLAN',
  REFINE = 'REFINE',
}

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true, default: [] })
  relevantFiles: string[];

  @Column('text', { nullable: true })
  context?: string;

  @Column('text', { nullable: true })
  generatedPlan?: string;

  @Column('text', { nullable: true })
  generatedHtmlPath?: string;

  @Column({
    type: 'enum',
    enum: Phase,
    default: Phase.SUMMARY,
  })
  phase: Phase;

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}