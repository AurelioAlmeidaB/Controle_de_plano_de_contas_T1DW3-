# Controle de Plano de Contas - T1 DW3

Trabalho 1 de Desenvolvimento Web 3 - IFSP Votuporanga.

CRUD de Plano de Contas e Lançamentos (1:N) do módulo financeiro de um ERP.

- Back-end: Node.js + Express + PostgreSQL (porta 41000)
- Front-end: Node.js + Express + Nunjucks (porta 41100)

## Como rodar

1. Banco: executar `backend/databaseConfig.sql` no banco `planocontas`.
2. Back-end: em `backend/`, copiar `.env.example` para `.env`, preencher e rodar `npm install` e `npm start`.
3. Front-end: em `frontend/`, rodar `npm install` e `npm start`.
4. Acessar http://localhost:41100 (usuário `qwe`, senha `qwe`).
