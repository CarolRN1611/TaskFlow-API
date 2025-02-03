import express from 'express'; // Importa o módulo express para criar rotas
import { PrismaClient } from '@prisma/client'; // Importa o cliente Prisma para interagir com o banco de dados
import bcrypt from 'bcrypt'; // Importa o módulo bcrypt para hashing de senhas
import jwt from 'jsonwebtoken'; // Importa o módulo jsonwebtoken para criação de tokens JWT
import authMiddleware from '../middleware/authMiddleware.js'; // Importa middleware de autenticação
import roleMiddleware from '../middleware/roleMiddleware.js'; // Importa middleware de verificação de roles

// Instâncias
const router = express.Router(); // Cria uma instância do roteador do express
const prisma = new PrismaClient(); // Cria uma instância do cliente Prisma

// Rota de registro
router.post('/register', async (req, res) => {
  const { nome, email, senha, roles } = req.body; 

  const hashedPassword = await bcrypt.hash(senha, 10);

  try {
    const user = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        roles,
        criadoEm: new Date(),
      },
    });
    res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao registrar usuário', details: err });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await prisma.usuarios.findUnique({ where: { email } }); // Busca usuário por email

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' }); // Verifica se usuário existe

    const isPasswordValid = await bcrypt.compare(senha, user.senha); // Compara senha
    if (!isPasswordValid) return res.status(401).json({ error: 'Credenciais inválidas' }); // Verifica se senha é válida

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, roles: user.roles },
      process.env.JWT_SECRET || '123@123', // Use uma chave segura em produção
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login bem-sucedido', token }); // Responde com sucesso e token
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar login', details: err });
  }
});

// Criar um novo usuário
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { nome, email, senha, roles } = req.body; // Extrai dados do corpo da requisição

  const hashedPassword = await bcrypt.hash(senha, 10); //criptografa a senha

  try {
    const user = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        roles: roles || 'user',
      },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar usuário', details: err }); 
  }
});

// Listar todos os usuários
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        roles: true,
        criadoEm: true,
        atualizadoEm: true,
        ultimoLogin: true,
      },
    });
    res.status(200).json(users); // Retorna a lista com todos os usuários
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários', details: err });
  }
});

// Listar usuário por ID (com atividades e tarefas relacionadas)
router.get('/:id', authMiddleware, async (req, res) => {
  const userId = req.params.id; // Extrai ID do usuário dos parâmetros da requisição

  try {
    // Validar se o ID é um ObjectId válido para MongoDB
    if (!userId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Buscar o usuário com as atividades e tarefas relacionadas
    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        roles: true,
        criadoEm: true,
        atualizadoEm: true,
        ultimoLogin: true,
        atividades: {
          include: {
            atividade: {
              include: {
                tarefas: true,
              },
            },
          },
        },
      },
    });

    // Verificar se o usuário foi encontrado
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' }); 
    }

    res.status(200).json(user); // Responde com usuário encontrado
  } catch (err) {
    console.error(err); // Log do erro para depuração
    res.status(500).json({ error: 'Erro ao buscar usuário', details: err.message });
  }
});

// Atualizar um usuário
router.put('/:id', authMiddleware, async (req, res) => {
  const userId = req.params.id; // Extrai ID do usuário dos parâmetros da requisição
  const { nome, email, senha, roles } = req.body;

  const hashedPassword = senha ? await bcrypt.hash(senha, 10) : undefined;

  try {
    const user = await prisma.usuarios.update({
      where: { id: userId },
      data: {
        nome,
        email,
        senha: hashedPassword,
        roles,
      },
    });
    res.status(200).json(user); 
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar usuário', details: err });
  }
});

// Deletar um usuário
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const userId = req.params.id; // Extrai ID do usuário dos parâmetros da requisição

  try {
    await prisma.usuarios.delete({
      where: { id: userId },
    });
    res.status(200).json('Usuário deletado com sucesso!');
  } catch (err) {
    res.status(400).json({ error: 'Erro ao deletar usuário', details: err });
  }
});

export default router; // Exporta o roteador para uso em outros módulos
