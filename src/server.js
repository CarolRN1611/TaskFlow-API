import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

// Instâncias
const app = express();
const prisma = new PrismaClient();

// Importar rotas
import userRoutes from './rotas/usuariosRotas.js';
import activityRoutes from './rotas/atividadesRotas.js';

// Configuração de CORS(quais dominios terão acesso a API)
app.use(cors({
  origin: ['http://seu-frontend.com', 'http://localhost:3000'], //adicionar o dominio do meu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para JSON
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'API de Atividades e Tarefas está funcionando!', status: 'ok' });
});

// Rotas
app.use('/usuarios', userRoutes);
app.use('/atividades', activityRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
});

// Fechar o Prisma Client ao encerrar (Prisma Client configura a conexão com o banco de dados mongodb)
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma Client desconectado.');
  process.exit(0);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
