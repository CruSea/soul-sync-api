import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { execSync } from 'child_process';
import 'tsconfig-paths/register';

let postgresContainer: StartedPostgreSqlContainer;
let postgresClient: Client;
let prismaService: PrismaService;

beforeAll(async () => {
  // Connect our container
  postgresContainer = await new PostgreSqlContainer().start();
  postgresClient = new Client({
    host: postgresContainer.getHost(),
    port: postgresContainer.getPort(),
    database: postgresContainer.getDatabase(),
    user: postgresContainer.getUsername(),
    password: postgresContainer.getPassword(),
  });
  await postgresClient.connect();

  // Set the new database URL
  const databaseUrl = `postgresql://${postgresClient.user}:${postgresClient.password}@${postgresClient.host}:${postgresClient.port}/${postgresClient.database}`;

  // Execute Prisma migrations
  execSync('npx prisma migrate dev', {
    env: {
      ...process.env, // Preserve existing environment variables
      DATABASE_URL: databaseUrl, // Set the DATABASE_URL for Prisma
    },
  });

  // Set prisma instance (no need to pass datasources to PrismaService constructor)
  prismaService = new PrismaService();

  console.log('connected to test db...');
});

afterAll(async () => {
  // Stop container as well as postgresClient
  await postgresClient.end();
  await postgresContainer.stop();
  console.log('test db stopped...');
});

// Set a timeout for jest to allow the containers to initialize
jest.setTimeout(300000);

export { postgresClient, prismaService };
