import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";

export enum MessageType {
  SUMMARY = 'SUMMARY',
  QUERY = 'QUERY',
  PLAN = 'PLAN',
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
  })
  role: MessageRole;

  @Column({
    type: 'enum',
    enum: MessageType,
  })
  type: MessageType;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column()
  chatId: string;

  @CreateDateColumn()
  createdAt: Date;
}