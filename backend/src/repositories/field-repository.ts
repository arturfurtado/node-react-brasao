import { AppDataSource } from "../config/data-source";
import { Field, DataType } from "../entities/fields";
import { Repository } from "typeorm";

export class FieldRepository {
    private repo: Repository<Field> = AppDataSource.getRepository(Field)

    findByName(name: string): Promise<Field | null> {
        return this.repo.findOneBy({name})
    }

    findById(id: string): Promise<Field | null> {
        return this.repo.findOneBy({id})
    }

    create(name: string, datatype: DataType): Promise<Field> {
        return this.repo.save({name, datatype})
    }

    findAllWithFills(): Promise<Field[]>{
        return this.repo.find({
            relations: ["fills"],
            order: {createdAt: "ASC"}
        })
    }
}

export const fieldRepository = new FieldRepository()
