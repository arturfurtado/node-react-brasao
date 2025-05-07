import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Fill } from './fills';

export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
}

const isTestEnv = process.env.NODE_ENV === 'test';

@Entity()
export class Field {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({
    type: isTestEnv ? 'varchar' : 'enum',
    enum: DataType,
  })
  datatype!: DataType;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Fill, (fill) => fill.field)
  fills!: Fill[];
}
