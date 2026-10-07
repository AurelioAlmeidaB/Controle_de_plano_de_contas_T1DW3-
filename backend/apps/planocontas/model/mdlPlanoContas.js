//-- arquivo apps/planocontas/model/mdlPlanoContas.js

const db = require("../../../database/databaseconfig");

const GetAllPlanoContas = async () => {
  return (
    await db.query(
      "SELECT * " + "FROM planocontas where removido = false ORDER BY codigo ASC"
    )
  ).rows;
};

const GetPlanoContaByID = async (planoContaIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM planocontas WHERE planocontaid = $1 and removido = false ORDER BY codigo ASC",
      [planoContaIDPar]
    )
  ).rows;
};

const InsertPlanoConta = async (registroPar) => {
  //@ Atenção: a variável msg é usada para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO planocontas " + "values(default, $1, $2, $3, $4, false)",
        [
          registroPar.codigo,
          registroPar.descricao,
          registroPar.tipo,
          registroPar.ativo,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPlanoContas|InsertPlanoConta] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdatePlanoConta = async (planoContaIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE planocontas SET " +
          "codigo = $2, " +
          "descricao = $3, " +
          "tipo = $4, " +
          "ativo = $5 " +
          "WHERE planocontaid = $1 and removido = false",
        [
          planoContaIDPar,
          registroPar.codigo,
          registroPar.descricao,
          registroPar.tipo,
          registroPar.ativo,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPlanoContas|UpdatePlanoConta] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

//@ Soft delete: o registro não é apagado, apenas o campo removido passa para true.
const DeletePlanoConta = async (planoContaIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    //@ Regra de negócio: não remove conta que possui lançamentos ativos.
    const lancamentos = (
      await db.query(
        "SELECT count(*) as total FROM lancamentos " +
          "WHERE planocontaid = $1 and removido = false",
        [planoContaIDPar]
      )
    ).rows[0];

    if (Number(lancamentos.total) > 0) {
      return {
        msg: "A conta possui " + lancamentos.total + " lançamento(s) ativo(s) e não pode ser removida.",
        linhasAfetadas: 0,
      };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE planocontas SET " + "removido = true " + "WHERE planocontaid = $1 and removido = false",
        [planoContaIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPlanoContas|DeletePlanoConta] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPlanoContas,
  GetPlanoContaByID,
  InsertPlanoConta,
  UpdatePlanoConta,
  DeletePlanoConta,
};
