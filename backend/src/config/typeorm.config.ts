import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: configService.get<'postgres'>('DB_TYPE') || 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: configService.get<number>('DB_PORT') || 5432,
  username: configService.get<string>('DB_USERNAME') || 'postgres',
  password: configService.get<string>('DB_PASSWORD') || 'postgres',
  database: configService.get<string>('DB_DATABASE') || 'coverdb',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE') || false,
  logging: configService.get<boolean>('DB_LOGGING') || false,
  autoLoadEntities: true,
});

