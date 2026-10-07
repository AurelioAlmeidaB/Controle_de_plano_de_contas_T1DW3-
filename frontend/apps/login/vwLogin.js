// Arquivo apps/login/vwLogin.js

document.addEventListener('DOMContentLoaded', function() {
  // Ao abrir a tela de login (inclusive pelo menu Sair) o usuário deixa de estar autenticado.
  dw3ClearIsLoggedCookie();
  dw3ExibirAvisoPendente('loginError');

  var form = document.getElementById('loginForm');

  if (!form) {
    return;
  }

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    vwLogin();
  });
});

async function vwLogin() {
  var form = document.getElementById('loginForm');
  var errorBox = document.getElementById('loginError');
  var servidorDw3 = form.dataset.servidorDw3; // Valor que vem de routes/rtLogin.js
  var usuario = document.getElementById('usuario').value.trim();
  var senha = document.getElementById('senha').value;
  var submitButton = form.querySelector('button[type="submit"]');

  errorBox.classList.add('d-none');

  if (!usuario || !senha) {
    dw3ExibirMensagem('loginError', 'Informe o usuário e a senha.', 'warning');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    var response = await fetch(servidorDw3 + '/Login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        UserName: usuario,
        Password: senha
      })
    });

    var data = await response.json().catch(function() { return {}; });

    if (!response.ok || !data.token) {
      throw new Error(data.message || 'Usuário ou senha inválidos.');
    }

    localStorage.setItem('token', data.token); // Salva o JWT para ser usado nas chamadas ao backend.
    localStorage.setItem('username', data.username || usuario);
    document.cookie = 'IsLogged=true; path=/'; // Usado para verificar se o usuário está ou não logado.
    window.location.href = '/home';
  } catch (error) {
    var mensagem = error instanceof TypeError
      ? 'Não foi possível conectar ao servidor backend.'
      : error.message;
    dw3ExibirMensagem('loginError', mensagem, 'danger');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
}
