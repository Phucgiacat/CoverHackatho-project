import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDocumentTable1761450000000 implements MigrationInterface {
    name = 'CreateDocumentTable1761450000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "document" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "originalFilename" text NOT NULL,
                "markdownFilename" text NOT NULL,
                "markdownPath" text NOT NULL,
                "fileSize" integer NOT NULL,
                "description" text,
                "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e57d3357f83f3cdc0d2d99ce9d7" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "document"`);
    }
}

