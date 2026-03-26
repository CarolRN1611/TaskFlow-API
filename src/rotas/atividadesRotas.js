import express from 'express';
import { prisma } from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

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
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.atividades.delete({
      where: {
        id,
      },
    });
    res.status(200).json({ message: 'Atividade deletada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao deletar a atividade', details: error.message });
  }
});

export default router;
