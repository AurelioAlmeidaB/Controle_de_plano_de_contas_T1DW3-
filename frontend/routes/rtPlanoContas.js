// arquivo: routes/rtPlanoContas.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('planocontas/vwLstPlanoContas', {
    title: 'Plano de Contas',
    showNavbar: true,
    activeMenu: 'planocontas',
    servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois o front em html não tem acesso ao arquivo .env
  });
});

router.get('/form', function(req, res) {
  res.render('planocontas/vwFormPlanoContas', {
    title: 'Formulário do Plano de Contas',
    showNavbar: true,
    activeMenu: 'planocontas',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
