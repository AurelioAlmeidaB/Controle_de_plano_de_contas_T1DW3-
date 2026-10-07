// arquivo: public/js/dw3frontend.js
// Funções compartilhadas por todas as telas do front-end.

function dw3IsLogged() {
  // Verifica se o Cookie IsLogged e o token JWT existem.
  const isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (!isLogged || !localStorage.getItem('token')) {
    window.location.href = '/login';
    return false;
  }

  return true;
}

function dw3ClearIsLoggedCookie() {
  // Limpa o Cookie IsLogged e as informações do usuário guardadas no localStorage.
  var isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (isLogged) {
    document.cookie = 'IsLogged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  localStorage.removeItem('token');
  localStorage.removeItem('username');
}

function dw3MontarHeadersAutenticacao(headers) {
  // Acrescenta o token JWT no cabeçalho Authorization das requisições ao backend.
  var token = localStorage.getItem('token');
  var finalHeaders = headers || {};

  if (token) {
    finalHeaders.Authorization = 'Bearer ' + token;
  }

  return finalHeaders;
}

// Faz a requisição ao backend já com o JWT. Se o token for inválido ou expirado,
// o usuário é enviado de volta para a tela de login.
async function dw3Requisicao(url, opcoes) {
  var config = opcoes || {};
  config.headers = dw3MontarHeadersAutenticacao(Object.assign({ 'content-type': 'application/json' }, config.headers));

  var response = await fetch(url, config);
  var data = await response.json().catch(function() { return {}; });

  if (response.status === 401 || data.auth === false) {
    dw3ClearIsLoggedCookie();
    dw3SalvarAviso('Sua sessão expirou. Faça login novamente.', 'warning');
    window.location.href = '/login';
    throw new Error(data.message || 'Sessão expirada.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Erro na comunicação com o servidor backend.');
  }

  return data;
}

function dw3OcultarBotao(id) {
  var botao = document.getElementById(id);

  if (botao) {
    botao.classList.add('d-none');
  }
}

function dw3MostrarBotao(id) {
  var botao = document.getElementById(id);

  if (botao) {
    botao.classList.remove('d-none');
  }

  return botao;
}

// Exibe uma mensagem em um elemento alert do Bootstrap. tipo: success, danger, warning, info.
function dw3ExibirMensagem(idElemento, mensagem, tipo) {
  var alertBox = document.getElementById(idElemento);

  if (!alertBox) {
    return;
  }

  alertBox.className = 'alert alert-' + (tipo || 'danger');
  alertBox.textContent = mensagem;
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Guarda um aviso para ser exibido na próxima tela (ex.: após inserir e voltar para a lista).
function dw3SalvarAviso(mensagem, tipo) {
  sessionStorage.setItem('dw3Aviso', JSON.stringify({ mensagem: mensagem, tipo: tipo || 'success' }));
}

function dw3ExibirAvisoPendente(idElemento) {
  var aviso = sessionStorage.getItem('dw3Aviso');

  if (!aviso) {
    return;
  }

  sessionStorage.removeItem('dw3Aviso');
  aviso = JSON.parse(aviso);
  dw3ExibirMensagem(idElemento, aviso.mensagem, aviso.tipo);
}

function dw3FormatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '';
  }

  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dw3FormatarData(data) {
  if (!data) {
    return '';
  }

  return new Date(String(data).slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');
}

function dw3EscaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Retorna o ID da URL (?id=) validando se é um número inteiro positivo.
function dw3ObterIdDaUrl() {
  var id = new URLSearchParams(window.location.search).get('id');

  if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
    return null;
  }

  return id;
}

// Habilita ou desabilita todos os campos de um formulário (usado nas telas de visualizar e remover).
function dw3HabilitarCampos(form, habilitar) {
  form.querySelectorAll('input, select, textarea').forEach(function(campo) {
    if (campo.type !== 'hidden') {
      campo.disabled = !habilitar;
    }
  });
}

// Linguagem em português para o componente DataTables.
var dw3DataTablesPtBr = {
  emptyTable: 'Nenhum registro cadastrado.',
  info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
  infoEmpty: 'Mostrando 0 até 0 de 0 registros',
  infoFiltered: '(filtrado de _MAX_ registros no total)',
  lengthMenu: 'Mostrar _MENU_ registros',
  loadingRecords: 'Carregando...',
  processing: 'Processando...',
  search: 'Pesquisar:',
  zeroRecords: 'Nenhum registro encontrado',
  paginate: {
    first: 'Primeiro',
    last: 'Último',
    next: 'Próximo',
    previous: 'Anterior'
  }
};

// Mostra o nome do usuário logado na barra de navegação.
document.addEventListener('DOMContentLoaded', function() {
  var navUsuario = document.getElementById('navUsuario');
  var username = localStorage.getItem('username');

  if (navUsuario && username) {
    navUsuario.textContent = username;
  }
});
