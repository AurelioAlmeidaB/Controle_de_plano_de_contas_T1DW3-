// Arquivo: apps/lancamentos/vwFormLancamentos.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmLancamentos');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirLancamento');
  var btnAtualizar = document.getElementById('btnAtualizarLancamento');
  var btnRemover = document.getElementById('btnRemoverLancamento');

  inicializarSelectPlanoContas();

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertLancamento();
    });
    carregarPlanoContasToLancamentos();
  }

  if (oper === 'Re') {
    bloquearCamposLancamento();
    vwGetLancamentoByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdateLancamento();
    });
    btnAtualizar.disabled = !(await vwGetLancamentoByID());
  }

  if (oper === 'De') {
    bloquearCamposLancamento();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeleteLancamento();
    });
    btnRemover.disabled = !(await vwGetLancamentoByID());
  }
});

// Aqui é inicializado o componente Select2.js em branco
function inicializarSelectPlanoContas() {
  $('#planocontaid').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione uma conta',
    width: '100%'
  });
}

function bloquearCamposLancamento() {
  document.getElementById('descricao').readOnly = true;
  document.getElementById('valor').readOnly = true;
  document.getElementById('datalancamento').readOnly = true;
  document.getElementById('planocontaid').disabled = true;
}

function montarLancamentoDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value,
    valor: Number(document.getElementById('valor').value),
    datalancamento: document.getElementById('datalancamento').value,
    planocontaid: Number(document.getElementById('planocontaid').value)
  };
}

function obterLancamentoIdDaUrl() {
  var lancamentoId = new URLSearchParams(window.location.search).get('lancamentoId');

  if (!lancamentoId || !/^\d+$/.test(lancamentoId) || Number(lancamentoId) <= 0) {
    throw new Error('ID do lançamento inválido.');
  }

  return lancamentoId;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoLancamento(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmLancamentos').dataset.servidorDw3;

  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  var response = await fetch(servidorDw3 + caminho, opcoes);

  if (!response.ok) {
    throw new Error(mensagemErro);
  }

  var data = await response.json();

  if (data.auth === false) {
    throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
  }

  if (data.status !== 'ok') {
    throw new Error(data.status || mensagemErro);
  }

  return data;
}

// Aqui é preenchido o componente Select2 com as contas disponíveis
async function carregarPlanoContasToLancamentos() {
  try {
    var data = await enviarRequisicaoLancamento('/getPlanoContasToLancamentos', {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar as contas.');

    var contaSelect = document.getElementById('planocontaid');
    contaSelect.innerHTML = '<option value="">Selecione uma conta</option>';

    data.registro.forEach(function(conta) {
      var option = document.createElement('option');
      option.value = conta.planocontaid;
      option.textContent = conta.codigo + ' - ' + conta.descricao + ' (' + conta.tipo + ')';
      contaSelect.appendChild(option);
    });

    $('#planocontaid').trigger('change');
  } catch (error) {
    alert(error.message || 'Erro ao carregar contas.');
  }
}

// Retorna true quando o lançamento foi carregado no formulário.
async function vwGetLancamentoByID() {
  try {
    var lancamentoId = obterLancamentoIdDaUrl();
    var data = await enviarRequisicaoLancamento('/getLancamentoByID/' + encodeURIComponent(lancamentoId), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar o lançamento.');

    var lancamento = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!lancamento) {
      throw new Error('Lançamento não encontrado.');
    }

    document.getElementById('lancamentoid').value = lancamento.lancamentoid;
    document.getElementById('descricao').value = lancamento.descricao ?? '';
    document.getElementById('valor').value = lancamento.valor ?? '';
    document.getElementById('datalancamento').value = lancamento.datalancamento ?? '';

    await carregarPlanoContasToLancamentos(); // Carrega o componente Select2.

    // Se a conta estiver inativa ela não vem na lista, então é adicionada aqui.
    var contaSelect = document.getElementById('planocontaid');
    if (!contaSelect.querySelector('option[value="' + lancamento.planocontaid + '"]')) {
      var option = document.createElement('option');
      option.value = lancamento.planocontaid;
      option.textContent = lancamento.codigo + ' - ' + lancamento.contadescricao + ' (' + lancamento.tipo + ')';
      contaSelect.appendChild(option);
    }

    $('#planocontaid').val(String(lancamento.planocontaid)).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar lançamento.');
    return false;
  }
}

async function vwInsertLancamento() {
  var form = document.getElementById('frmLancamentos');
  var btnInserir = document.getElementById('btnInserirLancamento');

  if (!form.reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoLancamento('/insertLancamento', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarLancamentoDoFormulario())
    }, 'Não foi possível inserir o lançamento.');

    window.location.href = '/lancamentos';
  } catch (error) {
    alert(error.message || 'Erro ao inserir lançamento.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateLancamento() {
  var form = document.getElementById('frmLancamentos');
  var btnAtualizar = document.getElementById('btnAtualizarLancamento');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var lancamentoId = obterLancamentoIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoLancamento('/updateLancamento/' + encodeURIComponent(lancamentoId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarLancamentoDoFormulario())
    }, 'Não foi possível atualizar o lançamento.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum lançamento foi atualizado.');
    }

    alert('Lançamento atualizado com sucesso.');
    window.location.href = '/lancamentos';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar lançamento.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteLancamento() {
  var btnRemover = document.getElementById('btnRemoverLancamento');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste lançamento?')) {
    return;
  }

  try {
    var lancamentoId = obterLancamentoIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoLancamento('/deleteLancamento/' + encodeURIComponent(lancamentoId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover o lançamento.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum lançamento foi removido.');
    }

    window.location.href = '/lancamentos';
  } catch (error) {
    alert(error.message || 'Erro ao remover lançamento.');
  } finally {
    btnRemover.disabled = false;
  }
}
