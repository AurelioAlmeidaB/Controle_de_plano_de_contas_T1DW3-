//-- arquivo: app.js
//-- Para rodar: node app.js

const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({ quiet: true });

// Importa o arquivo de rotas
const router = require('./routes/router');

const app = express();
const port = process.env.PORT || 41000;

// Configuração do CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(bodyParser.urlencoded({ extended: false, }));
app.use(express.json());

//@ Utiliza o routerApp configurado em ./routes/router.js
app.use(router);

app.listen(port, () => {
  console.log("Executando a aplicação:", process.env.APP_NAME);
  console.log(`App listening at port ${port}`);
});
