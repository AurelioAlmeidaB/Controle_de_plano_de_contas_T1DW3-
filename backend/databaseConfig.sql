-- arquivo: backend/databaseConfig.sql
-- Módulo financeiro: Controle de Plano de Contas
-- Relacionamento 1:N -> uma conta do plano de contas possui vários lançamentos.

----- Cria o banco de dados (executar conectado ao banco postgres)
-- create database planocontas;

create table IF NOT EXISTS planocontas (
    planocontaid bigserial constraint pk_planocontas PRIMARY KEY,
    codigo varchar(20) UNIQUE,
    descricao varchar(80),
    tipo varchar(10) constraint ck_planocontas_tipo CHECK (tipo in ('Receita', 'Despesa')),
    ativo boolean DEFAULT true,
    removido boolean DEFAULT false
);

insert into planocontas values
    (default, '1.1.01', 'Venda de produtos', 'Receita', true),
    (default, '1.1.02', 'Prestação de serviços', 'Receita', true),
    (default, '1.2.01', 'Rendimentos de aplicações', 'Receita', true),
    (default, '2.1.01', 'Aluguel', 'Despesa', true),
    (default, '2.1.02', 'Energia elétrica', 'Despesa', true),
    (default, '2.1.03', 'Folha de pagamento', 'Despesa', true),
    (default, '2.2.01', 'Material de escritório', 'Despesa', false)
    ON CONFLICT DO NOTHING;

create table IF NOT EXISTS lancamentos (
    lancamentoid bigserial constraint pk_lancamentos PRIMARY KEY,
    descricao varchar(100),
    valor numeric(12,2),
    datalancamento date,
    planocontaid bigint constraint fk_lancamento_planoconta REFERENCES planocontas,
    removido boolean DEFAULT false
);

insert into lancamentos values
    (1, 'Venda de sementes - cooperado 102', 15430.50, '2026-09-02',
        (SELECT planocontaid from planocontas where codigo = '1.1.01')),
    (2, 'Aluguel do armazém - setembro', 4200.00, '2026-09-05',
        (SELECT planocontaid from planocontas where codigo = '2.1.01')),
    (3, 'Conta de energia - setembro', 1385.72, '2026-09-10',
        (SELECT planocontaid from planocontas where codigo = '2.1.02')),
    (4, 'Assistência técnica a cooperados', 3800.00, '2026-09-15',
        (SELECT planocontaid from planocontas where codigo = '1.1.02'))
    ON CONFLICT DO NOTHING;

-- Ajusta a sequência após inserir IDs fixos
SELECT setval('lancamentos_lancamentoid_seq', (SELECT COALESCE(MAX(lancamentoid), 1) FROM lancamentos));

create table IF NOT EXISTS usuarios (
    usuarioid bigserial constraint pk_usuarios PRIMARY KEY,
    username varchar(10) UNIQUE,
    password text,
    removido boolean DEFAULT false
);

CREATE EXTENSION if NOT EXISTS pgcrypto;

insert into usuarios values
    (default, 'admin', crypt('admin', gen_salt('bf'))), -- senha criptografada com bcrypt
    (default, 'qwe', crypt('qwe', gen_salt('bf'))) -- senha criptografada com bcrypt
    ON CONFLICT DO NOTHING;
