import { AppDataSource } from "../config/data-source";
import { Fill } from "../entities/fills";
import { Repository } from "typeorm";

export class FillRepository {
    private fillRepo: Repository<Fill> = AppDataSource.getRepository(Fill)

    findById(id: string): Promise<Fill | null> {
        return this.fillRepo.findOne({where: { id }})
    }

    create(fieldId: string, value: string): Promise<Fill> {
        return this.fillRepo.save({fieldId, value})
    }

    findAllWithField(): Promise<Fill[]>{
        return this.fillRepo.find({
            relations: ["field"],
            order: {createdAt: "ASC"}
        })
    }
}

export const fillRepository = new FillRepository()
