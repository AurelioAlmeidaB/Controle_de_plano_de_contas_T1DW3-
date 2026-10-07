// arquivo: routes/rtLogin.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('login', {
    title: 'Login',
    showNavbar: false,
    servidorDw3: process.env.SERVIDOR_DW3 // Endereço do servidor backend
  });
});

module.exports = router;
