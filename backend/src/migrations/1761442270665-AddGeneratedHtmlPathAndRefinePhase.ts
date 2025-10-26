import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGeneratedHtmlPathAndRefinePhase1761442270665 implements MigrationInterface {
    name = 'AddGeneratedHtmlPathAndRefinePhase1761442270665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ADD "generatedHtmlPath" text`);
        await queryRunner.query(`ALTER TYPE "public"."chat_phase_enum" RENAME TO "chat_phase_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."chat_phase_enum" AS ENUM('SUMMARY', 'QUERY', 'PLAN', 'REFINE')`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "phase" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "phase" TYPE "public"."chat_phase_enum" USING "phase"::"text"::"public"."chat_phase_enum"`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "phase" SET DEFAULT 'SUMMARY'`);
        await queryRunner.query(`DROP TYPE "public"."chat_phase_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."chat_phase_enum_old" AS ENUM('SUMMARY', 'QUERY', 'PLAN')`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "phase" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "phase" TYPE "public"."chat_phase_enum_old" USING "phase"::"text"::"public"."chat_phase_enum_old"`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "phase" SET DEFAULT 'SUMMARY'`);
        await queryRunner.query(`DROP TYPE "public"."chat_phase_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."chat_phase_enum_old" RENAME TO "chat_phase_enum"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "generatedHtmlPath"`);
    }

}
