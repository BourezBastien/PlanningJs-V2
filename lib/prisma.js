<<<<<<< HEAD
import { PrismaClient as GlobalPrismaClient } from '../prisma/schema/prisma-global';
import { PrismaClient as ProjectPrismaClient } from '../prisma/schema/prisma-project';

export const globalPrisma = new GlobalPrismaClient();
export const projectPrisma = new ProjectPrismaClient();
=======
>>>>>>> e8261c2 (♻️ (prisma): refactor database structure to use PostgreSQL instead of MySQL)
