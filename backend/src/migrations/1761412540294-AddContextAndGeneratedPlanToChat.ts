import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContextAndGeneratedPlanToChat1761412540294 implements MigrationInterface {
    name = 'AddContextAndGeneratedPlanToChat1761412540294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ADD "context" text`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "generatedPlan" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "generatedPlan"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "context"`);
    }

}
