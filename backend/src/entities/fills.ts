import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, DataType } from './fields';

@Entity()
export class Fill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  fieldId!: string;

  @Column({ type: 'text' })
  value!: string;  

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Field, (field) => field.fills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fieldId' })
  field!: Field;

  parseValue(): string | number | boolean | Date {
    switch (this.field.datatype) {
      case DataType.NUMBER:
        return Number(this.value);
      case DataType.BOOLEAN:
        return this.value === 'true';
      case DataType.DATE:
        return new Date(this.value);
      default:
        return this.value;
    }
  }
}
