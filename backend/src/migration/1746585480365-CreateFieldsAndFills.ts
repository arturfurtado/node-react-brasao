import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFieldsAndFills1746585480365 implements MigrationInterface {
    name = 'CreateFieldsAndFills1746585480365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fill" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldId" uuid NOT NULL, "value" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_27c68239b5271f170cfe8946cc1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."field_datatype_enum" AS ENUM('string', 'number', 'boolean', 'date')`);
        await queryRunner.query(`CREATE TABLE "field" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "datatype" "public"."field_datatype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2acf9b4a880d0588141b332902c" UNIQUE ("name"), CONSTRAINT "PK_39379bba786d7a75226b358f81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fill" ADD CONSTRAINT "FK_3d820ab5d7aefa06e6e7c9f278a" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fill" DROP CONSTRAINT "FK_3d820ab5d7aefa06e6e7c9f278a"`);
        await queryRunner.query(`DROP TABLE "field"`);
        await queryRunner.query(`DROP TYPE "public"."field_datatype_enum"`);
        await queryRunner.query(`DROP TABLE "fill"`);
    }

}
