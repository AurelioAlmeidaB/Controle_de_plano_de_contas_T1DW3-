//-- arquivo apps/lancamentos/controller/ctlLancamentos.js

const mdlLancamentos = require("../model/mdlLancamentos");

const GetAllLancamentos = (req, res) =>
  (async () => {
    let registro = await mdlLancamentos.GetAllLancamentos();
    res.json({ status: "ok", "registro": registro });
  })();

const GetLancamentoByID = (req, res) =>
  (async () => {
    const lancamentoID = parseInt(req.params.lancamentoid);
    let registro = await mdlLancamentos.GetLancamentoByID(lancamentoID);
    res.json({ status: "ok", "registro": registro });
  })();

const GetPlanoContasToLancamentos = (req, res) =>
  (async () => {
    let registro = await mdlLancamentos.GetPlanoContasToLancamentos();
    res.json({ status: "ok", "registro": registro });
  })();

const InsertLancamento = (request, res) =>
  (async () => {
    const registro = request.body;
    let { msg, linhasAfetadas } = await mdlLancamentos.InsertLancamento(registro);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const UpdateLancamento = (request, res) =>
  (async () => {
    const lancamentoID = parseInt(request.params.lancamentoid);
    const registro = request.body;
    let { msg, linhasAfetadas } = await mdlLancamentos.UpdateLancamento(lancamentoID, registro);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const DeleteLancamento = (request, res) =>
  (async () => {
    const lancamentoID = parseInt(request.params.lancamentoid);
    let { msg, linhasAfetadas } = await mdlLancamentos.DeleteLancamento(lancamentoID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllLancamentos,
  GetLancamentoByID,
  GetPlanoContasToLancamentos,
  InsertLancamento,
  UpdateLancamento,
  DeleteLancamento,
};
