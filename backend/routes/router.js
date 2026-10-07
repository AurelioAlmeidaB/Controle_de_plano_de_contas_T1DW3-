//-- arquivo routes/router.js

const express = require("express");
const routerApp = express.Router();

const appPlanoContas = require("../apps/planocontas/controller/ctlPlanoContas");
const appLancamentos = require("../apps/lancamentos/controller/ctlLancamentos");
const appLogin = require("../apps/login/controller/ctlLogin");

// middleware that is specific to this router
routerApp.use((req, res, next) => {
  next();
});

routerApp.get("/", (req, res) => {
  res.send("API do Controle de Plano de Contas no ar!");
});

//@ Rotas de Plano de Contas (protegidas por JWT)
routerApp.get("/getAllPlanoContas", appLogin.AutenticaJWT, appPlanoContas.GetAllPlanoContas);
routerApp.get("/getPlanoContaByID/:planocontaid", appLogin.AutenticaJWT, appPlanoContas.GetPlanoContaByID);
routerApp.post("/insertPlanoConta", appLogin.AutenticaJWT, appPlanoContas.InsertPlanoConta);
routerApp.put("/updatePlanoConta/:planocontaid", appLogin.AutenticaJWT, appPlanoContas.UpdatePlanoConta);
routerApp.delete("/deletePlanoConta/:planocontaid", appLogin.AutenticaJWT, appPlanoContas.DeletePlanoConta);

//@ Rotas de Lançamentos (protegidas por JWT)
routerApp.get("/getAllLancamentos", appLogin.AutenticaJWT, appLancamentos.GetAllLancamentos);
routerApp.get("/getLancamentoByID/:lancamentoid", appLogin.AutenticaJWT, appLancamentos.GetLancamentoByID);
routerApp.get("/getPlanoContasToLancamentos", appLogin.AutenticaJWT, appLancamentos.GetPlanoContasToLancamentos);
routerApp.post("/insertLancamento", appLogin.AutenticaJWT, appLancamentos.InsertLancamento);
routerApp.put("/updateLancamento/:lancamentoid", appLogin.AutenticaJWT, appLancamentos.UpdateLancamento);
routerApp.delete("/deleteLancamento/:lancamentoid", appLogin.AutenticaJWT, appLancamentos.DeleteLancamento);

//@ Rota Login
routerApp.post("/Login", appLogin.Login);
routerApp.post("/Logout", appLogin.Logout);

module.exports = routerApp;
