import express from 'express';
import { PrismaClient } from '@prisma/client'; // Importa o cliente Prisma para interagir com o banco de dados
import authMiddleware from '../middleware/authMiddleware.js'; // Importa middleware de autenticação
import roleMiddleware from '../middleware/roleMiddleware.js'; //Importa middleware de verificação de roles
const router = express.Router();

// Instâncias
const app = express();
const prisma = new PrismaClient();

// Criar atividade (rota protegida) - authMiddleware verifica se o usuário está autenticado
router.post('/', authMiddleware, async (req, res) => {
  const { titulo, descricao, dataDeEntrega, prioridade, status, usuariosIds } = req.body; // `usuariosIds` é um array de IDs de usuários

  try {
    const atividade = await prisma.atividades.create({
      data: {
        titulo,
        descricao,
        dataDeEntrega,
        prioridade,
        status: status || false,
        responsaveis: {
          create: usuariosIds.map((usuarioId) => ({
            usuario: { connect: { id: usuarioId } },
          })),
        },
      },
      include: {
        responsaveis: { include: { usuario: true } }, // Inclui os dados dos usuários responsáveis
      },
    });

    res.status(201).json(atividade);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao criar a atividade' });
  }
});


// Listar todas as atividades (rota protegida) - roleMiddleware verifica se o usuário é admin - authMiddleware verifica se o usuário está autenticado
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const atividades = await prisma.atividades.findMany({
      include: {
        responsaveis: { include: { usuario: true } }, // Inclui dados dos usuários responsáveis
        tarefas: true, // Inclui as tarefas associadas
      },
    });

    res.status(200).json(atividades);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao listar as atividades' });
  }
});


// Listar atividades de um usuário
router.get('/usuario/:usuario_id', authMiddleware, async (req, res) => {
  const { usuarioId } = req.params; // Extrai o ID do usuário dos parâmetros da requisição

  try {
    const atividades = await prisma.atividades.findMany({
      where: {
        responsaveis: {
          some: { // Verifica se o usuário é responsável por alguma atividade
            usuarioId,
          },
        },
      },
      include: {
        responsaveis: { include: { usuario: true } }, // Inclui os dados dos responsáveis
        tarefas: true, // Inclui as tarefas associadas
      },
    });

    res.status(200).json(atividades);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao listar as atividades do usuário' });
  }
});


// Atualizar atividade
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, dataDeEntrega, prioridade, status, usuariosIds } = req.body;

  try {
    const atividade = await prisma.atividades.update({
      where: { id },
      data: {
        titulo,
        descricao,
        dataDeEntrega,
        prioridade,
        status,
        responsaveis: usuariosIds
          ? {
              deleteMany: {}, // Remove os responsáveis atuais
              create: usuariosIds.map((usuarioId) => ({
                usuario: { connect: { id: usuarioId } },
              })), // Adiciona os novos responsáveis
            }
          : undefined,
      },
      include: {
        responsaveis: { include: { usuario: true } },
      },
    });

    res.status(200).json(atividade);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao atualizar a atividade' });
  }
});


// Deletar atividade
router.delete('/:id',authMiddleware, async (req, res) => {
  const { id } = req.params;
  await prisma.atividades.delete({
    where: {
      id,
    },
  });
  res.status(200).json({ message: 'Atividade deletada com sucesso!' });
});

// Criar tarefa
router.post('/:atividade_id/tarefas',authMiddleware, async (req, res) => {
  const { atividade_id } = req.params;
  const { descricao, dataDeEntrega, prioridade, status } = req.body;

  const tarefa = await prisma.tarefas.create({
    data: { 
      descricao, 
      atividade_id,
      dataDeEntrega,    
      prioridade,       
      status: status || false, 
    },
  });
  res.status(201).json(tarefa);
});

// Atualizar tarefa
router.patch('/tarefas/:id',authMiddleware,async (req, res) => {
  const { id } = req.params;
  const { descricao, dataDeEntrega, prioridade, status } = req.body;

  const tarefa = await prisma.tarefas.update({
    where: { id },
    data: { 
      descricao,        
      dataDeEntrega,    
      prioridade,       
      status,           
    },
  });
  res.json(tarefa);
});

// Listar tarefas de uma atividade
router.get('/:atividade_id/tarefas',authMiddleware, async (req, res) => {
  const { atividade_id } = req.params;
  const tarefas = await prisma.tarefas.findMany({
    where: {
      atividade_id,
    },
  });
  res.json(tarefas);
});

// Deletar tarefa
router.delete('/:atividade_id/tarefas/:tarefa_id',authMiddleware, async (req, res) => {
  const { tarefa_id } = req.params;
  await prisma.tarefas.delete({
    where: {
      id: tarefa_id,
    },
  });
  res.status(200).json({ message: 'Tarefa deletada com sucesso!' });
});

export default router;
