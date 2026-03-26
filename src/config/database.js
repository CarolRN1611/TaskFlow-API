import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fechar o Prisma Client ao encerrar (Prisma Client configura a conexão com o banco de dados mongodb)
const disconnectDatabase = async () => {
  await prisma.$disconnect();
  console.log('Prisma Client desconectado.');
};

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export { prisma, disconnectDatabase };