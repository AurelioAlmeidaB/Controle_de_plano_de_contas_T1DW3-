// arquivo: routes/rtLancamentos.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('lancamentos/vwLstLancamentos', {
    title: 'Lançamentos',
    showNavbar: true,
    activeMenu: 'lancamentos',
    servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois o front em html não tem acesso ao arquivo .env
  });
});

router.get('/form', function(req, res) {
  res.render('lancamentos/vwFormLancamentos', {
    title: 'Formulário de Lançamentos',
    showNavbar: true,
    activeMenu: 'lancamentos',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
