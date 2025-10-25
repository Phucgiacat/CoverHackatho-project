import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export const dataSourceOptions: DataSourceOptions = {
  type: (process.env.DB_TYPE as 'postgres') || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'postgres',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

