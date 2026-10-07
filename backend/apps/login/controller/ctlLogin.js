//-- apps/login/controller/ctlLogin.js

const jwt = require("jsonwebtoken");
const bCrypt = require("bcryptjs");
const mdlLogin = require("../model/mdlLogin");

const Login = async (req, res, next) => {
  const { UserName, Password } = req.body;

  if (!UserName || !Password) {
    return res.status(400).json({ auth: false, message: "Informe usuário e senha!" });
  }

  const credencial = await mdlLogin.GetCredencial(UserName);

  if (credencial.length == 0) {
    return res.status(403).json({ auth: false, message: "Usuário não identificado!" });
  }

  if (bCrypt.compareSync(Password, credencial[0].password)) {
    //auth ok
    const username = credencial[0].username;
    const token = jwt.sign({ username }, process.env.SECRET_API, {
      expiresIn: 120 * 60, //@ Expira em 02 horas
    });
    return res.json({ auth: true, token: token, username: username });
  }

  res.status(403).json({ auth: false, message: "Login inválido!" });
};

//@ Middleware que protege as rotas das APIs: só passa quem enviar um JWT válido.
function AutenticaJWT(req, res, next) {
  const tokenHeader = req.headers["authorization"];
  if (!tokenHeader)
    return res
      .status(401)
      .json({ auth: false, message: "Não foi informado o token JWT" });

  const bearer = tokenHeader.split(" ");
  const token = bearer[1];

  jwt.verify(token, process.env.SECRET_API, function (err, decoded) {
    if (err)
      return res
        .status(401)
        .json({ auth: false, message: "JWT inválido ou expirado" });

    req.username = decoded.username;
    next();
  });
}

const Logout = (req, res, next) => {
  res.json({ auth: false, token: null });
};

module.exports = {
  Login,
  Logout,
  AutenticaJWT,
};
