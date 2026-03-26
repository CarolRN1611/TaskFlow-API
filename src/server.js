import express from 'express';
import { prisma, disconnectDatabase } from './config/database.js';
import cors from 'cors';

// Instâncias
const app = express();

// Importar rotas
import userRoutes from './rotas/usuariosRotas.js';
import activityRoutes from './rotas/atividadesRotas.js';
import taskRoutes from './rotas/tarefasRotas.js';

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
app.use('/tarefas', taskRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\nEncerrando servidor...');
  await disconnectDatabase();
  process.exit(0);
});
