//Arquivo apps/login/vwLogin.js

document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('loginForm');
  var errorBox = document.getElementById('loginError');

  if (!form) {
    return;
  }

  // Ao abrir a tela de login (inclusive pelo menu Sair) a sessão anterior é encerrada.
  vwLogout(form.dataset.servidorDw3);

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    var servidorDw3 = form.dataset.servidorDw3; // Valor que vem de routes/rtLogin.js
    var usuario = document.getElementById('usuario').value;
    var senha = document.getElementById('senha').value;
    var submitButton = form.querySelector('button[type="submit"]');

    if (errorBox) {
      errorBox.classList.add('d-none');
      errorBox.textContent = '';
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Entrando...';
    }

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

      if (!response.ok) {
        throw new Error('Usuário ou senha inválidos.');
      }

      var data = await response.json();
      var token = data.token;

      if (!token) {
        throw new Error('Erro no login. Token não retornado pelo servidor.');
      }

      localStorage.setItem('token', token); // Salva o token para ser usado nas chamadas ao backend.
      localStorage.setItem('username', data.username); // Usuário que fez o login.
      document.cookie = 'IsLogged=true; path=/'; // Usado para verificar se o usuário está ou não logado.
      window.location.href = '/home';

    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || 'Não foi possível realizar o login.';
        errorBox.classList.remove('d-none');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
      }
    }
  });
});

// Chama a API de Logout do backend e limpa os dados do usuário no navegador.
async function vwLogout(servidorDw3) {
  if (localStorage.getItem('token')) {
    try {
      await fetch(servidorDw3 + '/Logout', {
        method: 'POST',
        headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' })
      });
    } catch (error) {
      console.log('Não foi possível avisar o backend do logout.');
    }
  }

  localStorage.removeItem('token');
  localStorage.removeItem('username');
  dw3ClearIsLoggedCookie();
}
