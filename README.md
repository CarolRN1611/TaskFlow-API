# API de Tarefas

API RESTful desenvolvida em **Node.js + Express** para gerenciamento de **tarefas individuais e em grupo**, com autenticação via **JWT** e persistência de dados em **MongoDB** utilizando **Prisma ORM**.

---

## Funcionalidades

* Cadastro e autenticação de usuários (JWT)
* Controle de acesso por **roles** (ex.: `admin`)
* CRUD de **atividades** (tarefas em grupo)
* CRUD de **tarefas individuais**
* Associação de usuários a atividades
* Middlewares de autenticação e autorização

---

## Tecnologias utilizadas

* **Node.js** 18+
* **Express**
* **MongoDB**
* **Prisma ORM**
* **JWT (JSON Web Token)**
* **bcrypt** (hash de senhas)
* **dotenv** (variáveis de ambiente)

---

## Pré-requisitos

Antes de iniciar, você precisa ter instalado:

* Node.js 18 ou superior
* MongoDB (local ou Atlas)
* npm ou yarn
* npx (para comandos do Prisma)

---

## Instalação

1. Clone o repositório:

   ```sh
   git clone https://github.com/seu-usuario/api-tarefas.git
   cd api-tarefas
   ```

2. Instale as dependências:

   ```sh
   npm install
   ```

3. Configure o arquivo `.env`:

   ```env
   PORT=3000
   DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/tarefas"
   JWT_SECRET=sua_chave_secreta_super_forte
   ```

4. Gere o client do Prisma e aplique o schema:

   ```sh
   npx prisma generate
   npx prisma db push
   ```

---

## Execução do projeto

### Ambiente de desenvolvimento

```sh
npm run dev
```

### Ambiente de produção

```sh
npm run start
```

A API será iniciada na porta definida em `PORT` ou, por padrão, **3000**.

---

## Autenticação

A autenticação é feita via **JWT**. Após o login, utilize o token retornado no header das requisições protegidas:

```
Authorization: Bearer <seu_token>
```

---

## Endpoints principais

### Usuários

* **POST** `/usuarios/register` — Cadastrar usuário
* **POST** `/usuarios/login` — Login e geração do token
* **GET** `/usuarios` — Listar usuários (protegido)

### Atividades

* **POST** `/atividades` — Criar atividade (protegido)
* **GET** `/atividades` — Listar atividades do usuário (protegido)

### Tarefas

* **POST** `/atividades/:atividade_id/tarefas` — Criar tarefa em uma atividade (protegido)

---

## Exemplos de uso (cURL)

### 1️⃣ Cadastro de usuário

```sh
curl -X POST http://localhost:3000/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@example.com","senha":"senha123"}'
```

### 2️⃣ Login

```sh
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","senha":"senha123"}'
```

### 3️⃣ Acesso a rota protegida

```sh
curl http://localhost:3000/atividades \
  -H "Authorization: Bearer <token>"
```

---

## Estrutura do projeto

```
src/
├── server.js
├── rotas/
│   ├── usuariosRotas.js
│   └── atividadesRotas.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── prisma/
│   └── schema.prisma
```

---

## Boas práticas de segurança

* Não versionar o arquivo `.env`
* Utilize um `JWT_SECRET` forte em produção
* Proteja sua URI do MongoDB
* Faça hash de senhas com bcrypt

---

## Contribuição

Contribuições são bem-vindas!

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas alterações (`git commit -m 'feat: nova feature'`)
4. Faça o push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais informações.

---

Projeto ideal para estudos de **Node.js**, **APIs REST**, **autenticação JWT** e **Prisma com MongoDB**.
