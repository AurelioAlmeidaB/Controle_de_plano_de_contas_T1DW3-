# Controle de Plano de Contas - T1 DW3

Trabalho 1 da disciplina Desenvolvimento Web 3 (DW3) - IFSP Votuporanga.

Sistema para o módulo financeiro de um ERP de cooperativas, com o CRUD das tabelas **planocontas** e **lancamentos**
(relacionamento 1:N: uma conta possui vários lançamentos). Segue a mesma estrutura do sistema acadêmico
desenvolvido em aula: um servidor back-end com as APIs e um servidor front-end com as telas.

- Back-end: Node.js + Express + PostgreSQL, porta **41000**
- Front-end: Node.js + Express + Nunjucks + Bootstrap, porta **41100**

## Banco de dados

O script está em `backend/databaseConfig.sql`. Ele cria as tabelas `planocontas`, `lancamentos` e `usuarios`
e já insere alguns registros para teste.

```bash
docker exec dw3postgres psql -U postgres -c "create database planocontas;"
docker exec -i dw3postgres psql -U postgres -d planocontas < backend/databaseConfig.sql
```

## Back-end

```bash
cd backend
cp .env.example .env
npm install
npm start
```

No arquivo `.env` preencha o usuário e a senha do banco (`DB_USER` e `DB_PASS`) e uma chave para o JWT (`SECRET_API`).
Para gerar a chave pode usar:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

O `.env` não vai para o GitHub (está no `.gitignore`), por isso cada um precisa criar o seu.

APIs (todas, menos Login e Logout, precisam do token JWT):

| Plano de contas | Lançamentos |
|---|---|
| GET /getAllPlanoContas | GET /getAllLancamentos |
| GET /getPlanoContaByID/:planocontaid | GET /getLancamentoByID/:lancamentoid |
| POST /insertPlanoConta | POST /insertLancamento |
| PUT /updatePlanoConta/:planocontaid | PUT /updateLancamento/:lancamentoid |
| DELETE /deletePlanoConta/:planocontaid | DELETE /deleteLancamento/:lancamentoid |
| | GET /getPlanoContasToLancamentos |

O delete não apaga o registro, só muda o campo `removido` para true. Uma conta que ainda tem lançamentos
não pode ser removida.

Os testes das APIs estão nos arquivos `.rest` dentro de `backend/apps/*/tests` (extensão REST Client do VSCode).

## Front-end

```bash
cd frontend
npm install
npm start
```

Acesse http://localhost:41100 e entre com o usuário `qwe` e senha `qwe`.
