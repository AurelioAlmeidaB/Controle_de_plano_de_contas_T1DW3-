# Controle de Plano de Contas — T1 DW3

Trabalho da disciplina **Desenvolvimento Web 3 (DW3)** — IFSP Votuporanga.

Módulo financeiro de um sistema ERP de controle de cooperativas: CRUD de **Plano de Contas** e **Lançamentos**,
seguindo a arquitetura Cliente-Servidor da apostila (back-end de APIs + front-end em servidores e portas separados).

| Servidor  | Tecnologia                                   | Porta  |
|-----------|----------------------------------------------|--------|
| Back-end  | Node.js, Express, pg, JWT, bcryptjs          | 41000  |
| Front-end | Node.js, Express, Nunjucks, Bootstrap 5, DataTables, Select2 | 41100  |
| SGBD      | PostgreSQL                                   | 5432   |

## Modelo de dados (1:N)

Uma conta do **plano de contas** possui vários **lançamentos**.

```
planocontas                         lancamentos
-----------------------             ------------------------------
planocontaid  (ID)        1 ──── N  lancamentoid   (ID)
codigo        texto                 descricao      texto
descricao     texto                 valor          decimal (12,2)
tipo          Receita/Despesa       datalancamento data
ativo         boolean               planocontaid   (FK → planocontas)
removido      boolean               removido       boolean
```

Todas as tabelas possuem os campos **ID** e **removido** (soft delete).
O script completo está em [backend/databaseConfig.sql](backend/databaseConfig.sql).

## APIs do back-end

Todas as rotas de CRUD são protegidas com **JWT** (cabeçalho `Authorization: Bearer <token>`).

| Plano de Contas                          | Lançamentos                               |
|------------------------------------------|-------------------------------------------|
| `GET    /getAllPlanoContas`              | `GET    /getAllLancamentos`               |
| `GET    /getPlanoContaByID/:planocontaid`| `GET    /getLancamentoByID/:lancamentoid`  |
| `POST   /insertPlanoConta`               | `POST   /insertLancamento`                |
| `PUT    /updatePlanoConta/:planocontaid` | `PUT    /updateLancamento/:lancamentoid`  |
| `DELETE /deletePlanoConta/:planocontaid` | `DELETE /deleteLancamento/:lancamentoid`  |
|                                          | `GET    /getPlanoContasToLancamentos` (contas para o Select) |

Login: `POST /Login` (`{ "UserName": "...", "Password": "..." }`) e `POST /Logout`.

Regras de negócio:
- `GetAll` e `GetByID` retornam somente registros com `removido = false`.
- `Delete` faz **soft delete** (`removido = true`), o registro não é apagado fisicamente.
- Uma conta com lançamentos ativos não pode ser removida.

Os testes das APIs (extensão REST Client do VSCode) estão em `backend/apps/*/tests/*.rest`.

## Front-end

Para cada API existe uma função correspondente no front-end:

| Plano de Contas (`apps/planocontas`) | Lançamentos (`apps/lancamentos`) |
|--------------------------------------|----------------------------------|
| `vwGetAllPlanoContas()`              | `vwGetAllLancamentos()`          |
| `vwGetPlanoContaByID()`              | `vwGetLancamentoByID()`          |
| `vwInsertPlanoConta()`               | `vwInsertLancamento()`           |
| `vwUpdatePlanoConta()`               | `vwUpdateLancamento()`           |
| `vwDeletePlanoConta()`               | `vwDeleteLancamento()`           |
|                                      | `vwGetPlanoContasToLancamentos()`|

Após o login, o JWT e o nome do usuário ficam no `localStorage` e o cookie `IsLogged` indica que o usuário está autenticado.
Se o token expirar, o usuário volta para a tela de login. O front-end nunca acessa o SGBD diretamente: tudo passa pelas APIs.

## Como executar

### 1. Banco de dados

Com o PostgreSQL rodando na porta 5432, crie o banco e execute o script:

```bash
psql -U postgres -c "create database planocontas;"
psql -U postgres -d planocontas -f backend/databaseConfig.sql
```

Se o Postgres estiver em um container Docker (ex.: `dw3postgres`):

```bash
docker exec dw3postgres psql -U postgres -c "create database planocontas;"
docker exec -i dw3postgres psql -U postgres -d planocontas < backend/databaseConfig.sql
```

### 2. Back-end

```bash
cd backend
cp .env.example .env   # preencha SECRET_API, DB_USER e DB_PASS
npm install
node app.js            # http://localhost:41000
```

### 3. Front-end

```bash
cd frontend
npm install
node app.js            # http://localhost:41100
```

Acesse **http://localhost:41100** e entre com o usuário **qwe** / senha **qwe** (ou **admin** / **admin**).

## Estrutura

```
backend/
  app.js                      # servidor, CORS e rotas
  databaseConfig.sql          # script do banco
  database/databaseconfig.js  # conexão com o PostgreSQL
  routes/router.js            # rotas das APIs
  apps/
    login/        {model, controller, tests}
    planocontas/  {model, controller, tests}
    lancamentos/  {model, controller, tests}
frontend/
  app.js                      # servidor Express + Nunjucks
  frontend.env                # porta e endereço do back-end
  routes/                     # rtIndex, rtLogin, rtHome, rtPlanoContas, rtLancamentos
  views/                      # layout, login, home, error
  public/js/dw3frontend.js    # funções compartilhadas (JWT, mensagens, formatação)
  apps/
    login/        vwLogin.js
    home/         vwHome.js
    planocontas/  vwLstPlanoContas.{njk,js}, vwFormPlanoContas.{njk,js}
    lancamentos/  vwLstLancamentos.{njk,js},  vwFormLancamentos.{njk,js}
```
