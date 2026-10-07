// Arquivo: apps/lancamentos/vwFormLancamentos.js
// Operações recebidas pela URL (?oper=):
//   Cr = cadastrar | Re = visualizar | Up = atualizar | De = remover

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmLancamentos');
  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var titulos = { Cr: 'Novo lançamento', Re: 'Visualizar lançamento', Up: 'Atualizar lançamento', De: 'Remover lançamento' };

  document.getElementById('tituloOperacao').textContent = titulos[oper] || 'Formulário';
  inicializarSelectPlanoContas();

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    if (oper === 'Cr') {
      vwInsertLancamento();
    } else if (oper === 'Up') {
      vwUpdateLancamento();
    }
  });

  if (oper === 'Cr') {
    dw3MostrarBotao('btnInserirLancamento');
    document.getElementById('datalancamento').value = new Date().toLocaleDateString('sv-SE'); // Data de hoje (AAAA-MM-DD)
    await vwGetPlanoContasToLancamentos();
    document.getElementById('descricao').focus();
    return;
  }

  if (oper === 'Re') {
    await vwGetLancamentoByID();
    dw3HabilitarCampos(form, false);
    return;
  }

  if (oper === 'Up') {
    var btnAtualizar = dw3MostrarBotao('btnAtualizarLancamento');
    btnAtualizar.disabled = !(await vwGetLancamentoByID());
    return;
  }

  if (oper === 'De') {
    var btnRemover = dw3MostrarBotao('btnRemoverLancamento');
    btnRemover.disabled = !(await vwGetLancamentoByID());
    dw3HabilitarCampos(form, false);
    btnRemover.addEventListener('click', function() {
      vwDeleteLancamento();
    });
    return;
  }

  dw3ExibirMensagem('lancamentoAlert', 'Operação inválida.', 'danger');
});

// Aqui é inicializado o componente Select2 em branco.
function inicializarSelectPlanoContas() {
  $('#planocontaid').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione uma conta',
    width: '100%'
  });
}

function obterServidorLancamentos() {
  var servidorDw3 = document.getElementById('frmLancamentos').dataset.servidorDw3;

  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  return servidorDw3;
}

function mensagemDeErro(error, padrao) {
  return error instanceof TypeError
    ? 'Não foi possível conectar ao servidor backend.'
    : error.message || padrao;
}

function montarLancamentoDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value.trim(),
    valor: Number(document.getElementById('valor').value),
    datalancamento: document.getElementById('datalancamento').value,
    planocontaid: Number(document.getElementById('planocontaid').value)
  };
}

// Consome a API getPlanoContasToLancamentos e preenche o Select2 com as contas ativas.
async function vwGetPlanoContasToLancamentos() {
  try {
    var data = await dw3Requisicao(obterServidorLancamentos() + '/getPlanoContasToLancamentos');

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var select = document.getElementById('planocontaid');
    select.innerHTML = '<option value="">Selecione uma conta</option>';

    data.registro.forEach(function(conta) {
      var option = document.createElement('option');
      option.value = conta.planocontaid;
      option.textContent = conta.codigo + ' - ' + conta.descricao + ' (' + conta.tipo + ')';
      select.appendChild(option);
    });

    $('#planocontaid').trigger('change');
  } catch (error) {
    dw3ExibirMensagem('lancamentoAlert', mensagemDeErro(error, 'Erro ao carregar as contas.'), 'danger');
  }
}

// Consome a API getLancamentoByID e preenche os campos. Retorna true se encontrou o lançamento.
async function vwGetLancamentoByID() {
  try {
    var id = dw3ObterIdDaUrl();

    if (!id) {
      throw new Error('ID do lançamento inválido.');
    }

    var data = await dw3Requisicao(obterServidorLancamentos() + '/getLancamentoByID/' + encodeURIComponent(id));

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var lancamento = data.registro[0];

    if (!lancamento) {
      throw new Error('Lançamento não encontrado ou já removido.');
    }

    document.getElementById('lancamentoid').value = lancamento.lancamentoid;
    document.getElementById('descricao').value = lancamento.descricao ?? '';
    document.getElementById('valor').value = lancamento.valor ?? '';
    document.getElementById('datalancamento').value = lancamento.datalancamento ? lancamento.datalancamento.slice(0, 10) : '';

    await vwGetPlanoContasToLancamentos(); // Carrega o componente Select2.

    // Se a conta do lançamento estiver inativa, ela não vem na lista; então é adicionada para exibição.
    var select = document.getElementById('planocontaid');
    if (!select.querySelector('option[value="' + lancamento.planocontaid + '"]')) {
      var option = document.createElement('option');
      option.value = lancamento.planocontaid;
      option.textContent = lancamento.codigo + ' - ' + lancamento.contadescricao + ' (' + lancamento.tipo + ', inativa)';
      select.appendChild(option);
    }

    $('#planocontaid').val(String(lancamento.planocontaid)).trigger('change');

    return true;
  } catch (error) {
    dw3ExibirMensagem('lancamentoAlert', mensagemDeErro(error, 'Erro ao carregar o lançamento.'), 'danger');
    return false;
  }
}

// Consome a API insertLancamento.
async function vwInsertLancamento() {
  var form = document.getElementById('frmLancamentos');
  var btnInserir = document.getElementById('btnInserirLancamento');

  if (!form.reportValidity()) {
    return;
  }

  btnInserir.disabled = true;

  try {
    var data = await dw3Requisicao(obterServidorLancamentos() + '/insertLancamento', {
      method: 'POST',
      body: JSON.stringify(montarLancamentoDoFormulario())
    });

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir o lançamento.');
    }

    dw3SalvarAviso('Lançamento inserido com sucesso.', 'success');
    window.location.href = '/lancamentos';
  } catch (error) {
    dw3ExibirMensagem('lancamentoAlert', mensagemDeErro(error, 'Erro ao inserir o lançamento.'), 'danger');
  } finally {
    btnInserir.disabled = false;
  }
}

// Consome a API updateLancamento.
async function vwUpdateLancamento() {
  var form = document.getElementById('frmLancamentos');
  var btnAtualizar = document.getElementById('btnAtualizarLancamento');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  btnAtualizar.disabled = true;

  try {
    var id = document.getElementById('lancamentoid').value;

    var data = await dw3Requisicao(obterServidorLancamentos() + '/updateLancamento/' + encodeURIComponent(id), {
      method: 'PUT',
      body: JSON.stringify(montarLancamentoDoFormulario())
    });

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar o lançamento.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum lançamento foi atualizado.');
    }

    dw3SalvarAviso('Lançamento atualizado com sucesso.', 'success');
    window.location.href = '/lancamentos';
  } catch (error) {
    dw3ExibirMensagem('lancamentoAlert', mensagemDeErro(error, 'Erro ao atualizar o lançamento.'), 'danger');
  } finally {
    btnAtualizar.disabled = false;
  }
}

// Consome a API deleteLancamento (soft delete).
async function vwDeleteLancamento() {
  var btnRemover = document.getElementById('btnRemoverLancamento');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção do lançamento "' + document.getElementById('descricao').value + '"?')) {
    return;
  }

  btnRemover.disabled = true;

  try {
    var id = document.getElementById('lancamentoid').value;

    var data = await dw3Requisicao(obterServidorLancamentos() + '/deleteLancamento/' + encodeURIComponent(id), {
      method: 'DELETE'
    });

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover o lançamento.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum lançamento foi removido.');
    }

    dw3SalvarAviso('Lançamento removido com sucesso.', 'success');
    window.location.href = '/lancamentos';
  } catch (error) {
    dw3ExibirMensagem('lancamentoAlert', mensagemDeErro(error, 'Erro ao remover o lançamento.'), 'danger');
    btnRemover.disabled = false;
  }
}
