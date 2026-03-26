import express from "express";
import { prisma } from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Criar tarefa
router.post("/:atividade_id/tarefas", authMiddleware, async (req, res) => {
  const { atividade_id } = req.params;
  const { descricao, dataDeEntrega, prioridade, status } = req.body;

  try {
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
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar a tarefa" });
  }
});

// Atualizar tarefa
router.patch("/tarefas/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { descricao, dataDeEntrega, prioridade, status } = req.body;

  try {
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
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar a tarefa" });
  }
});

// Listar tarefas de uma atividade
router.get("/:atividade_id/tarefas", authMiddleware, async (req, res) => {
  const { atividade_id } = req.params;
  try {
    const tarefas = await prisma.tarefas.findMany({
      where: {
        atividade_id,
      },
    });
    res.json(tarefas);
  } catch (error) {
    res.status(400).json({ error: "Erro ao listar as tarefas" });
  }
});

// Deletar tarefa
router.delete("/:atividade_id/tarefas/:tarefa_id", authMiddleware, async (req, res) => {
  try {
    const { tarefa_id } = req.params;
    await prisma.tarefas.delete({
      where: {
        id: tarefa_id,
      },
    });
    res.status(200).json({ message: "Tarefa deletada com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar a tarefa" });
  }
});

export default router;
