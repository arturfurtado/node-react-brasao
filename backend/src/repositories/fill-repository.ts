import { AppDataSource } from "../config/data-source";
import { Fill } from "../entities/fills";
import { Repository } from "typeorm";

export class FillRepository {
  private fillRepo: Repository<Fill> = AppDataSource.getRepository(Fill);

  findByFieldId(fieldId: string): Promise<Fill[]> {
    return this.fillRepo.find({
      where: { fieldId },
    });
  }

  findById(id: string): Promise<Fill | null> {
    return this.fillRepo.findOne({ where: { id } });
  }

  create(fieldId: string, value: string): Promise<Fill> {
    return this.fillRepo.save({ fieldId, value });
  }

  findAllWithField(): Promise<Fill[]> {
    return this.fillRepo.find({
      relations: ["field"],
      order: { createdAt: "ASC" },
    });
  }

  async update(
    id: string,
    attrs: Partial<{ value: string }>
  ): Promise<Fill> {
    await this.fillRepo.update(id, attrs);
    return (await this.findById(id)) as Fill;
  }

  async delete(id: string): Promise<void> {
    await this.fillRepo.delete(id);
  }
}

export const fillRepository = new FillRepository();
