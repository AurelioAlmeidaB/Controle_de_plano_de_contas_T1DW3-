// Arquivo: apps/planocontas/vwFormPlanoContas.js
// Operações recebidas pela URL (?oper=):
//   Cr = cadastrar | Re = visualizar | Up = atualizar | De = remover

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPlanoContas');
  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var titulos = { Cr: 'Nova conta', Re: 'Visualizar conta', Up: 'Atualizar conta', De: 'Remover conta' };

  document.getElementById('tituloOperacao').textContent = titulos[oper] || 'Formulário';

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    if (oper === 'Cr') {
      vwInsertPlanoConta();
    } else if (oper === 'Up') {
      vwUpdatePlanoConta();
    }
  });

  if (oper === 'Cr') {
    dw3MostrarBotao('btnInserirPlanoConta');
    document.getElementById('codigo').focus();
    return;
  }

  if (oper === 'Re') {
    dw3HabilitarCampos(form, false);
    await vwGetPlanoContaByID();
    return;
  }

  if (oper === 'Up') {
    var btnAtualizar = dw3MostrarBotao('btnAtualizarPlanoConta');
    btnAtualizar.disabled = !(await vwGetPlanoContaByID());
    return;
  }

  if (oper === 'De') {
    dw3HabilitarCampos(form, false);
    var btnRemover = dw3MostrarBotao('btnRemoverPlanoConta');
    btnRemover.disabled = !(await vwGetPlanoContaByID());
    btnRemover.addEventListener('click', function() {
      vwDeletePlanoConta();
    });
    return;
  }

  dw3ExibirMensagem('planoContaAlert', 'Operação inválida.', 'danger');
});

function montarPlanoContaDoFormulario() {
  return {
    codigo: document.getElementById('codigo').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    tipo: document.getElementById('tipo').value,
    ativo: document.getElementById('ativo').checked
  };
}

function obterServidorPlanoContas() {
  var servidorDw3 = document.getElementById('frmPlanoContas').dataset.servidorDw3;

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

// Consome a API getPlanoContaByID e preenche os campos. Retorna true se encontrou a conta.
async function vwGetPlanoContaByID() {
  try {
    var id = dw3ObterIdDaUrl();

    if (!id) {
      throw new Error('ID da conta inválido.');
    }

    var data = await dw3Requisicao(obterServidorPlanoContas() + '/getPlanoContaByID/' + encodeURIComponent(id));

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var conta = data.registro[0];

    if (!conta) {
      throw new Error('Conta não encontrada ou já removida.');
    }

    document.getElementById('planocontaid').value = conta.planocontaid;
    document.getElementById('codigo').value = conta.codigo ?? '';
    document.getElementById('descricao').value = conta.descricao ?? '';
    document.getElementById('tipo').value = conta.tipo ?? '';
    document.getElementById('ativo').checked = conta.ativo === true;

    return true;
  } catch (error) {
    dw3ExibirMensagem('planoContaAlert', mensagemDeErro(error, 'Erro ao carregar a conta.'), 'danger');
    return false;
  }
}

// Consome a API insertPlanoConta.
async function vwInsertPlanoConta() {
  var form = document.getElementById('frmPlanoContas');
  var btnInserir = document.getElementById('btnInserirPlanoConta');

  if (!form.reportValidity()) {
    return;
  }

  btnInserir.disabled = true;

  try {
    var data = await dw3Requisicao(obterServidorPlanoContas() + '/insertPlanoConta', {
      method: 'POST',
      body: JSON.stringify(montarPlanoContaDoFormulario())
    });

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir a conta.');
    }

    dw3SalvarAviso('Conta inserida com sucesso.', 'success');
    window.location.href = '/planocontas';
  } catch (error) {
    dw3ExibirMensagem('planoContaAlert', mensagemDeErro(error, 'Erro ao inserir a conta.'), 'danger');
  } finally {
    btnInserir.disabled = false;
  }
}

// Consome a API updatePlanoConta.
async function vwUpdatePlanoConta() {
  var form = document.getElementById('frmPlanoContas');
  var btnAtualizar = document.getElementById('btnAtualizarPlanoConta');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  btnAtualizar.disabled = true;

  try {
    var id = document.getElementById('planocontaid').value;

    var data = await dw3Requisicao(obterServidorPlanoContas() + '/updatePlanoConta/' + encodeURIComponent(id), {
      method: 'PUT',
      body: JSON.stringify(montarPlanoContaDoFormulario())
    });

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar a conta.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma conta foi atualizada.');
    }

    dw3SalvarAviso('Conta atualizada com sucesso.', 'success');
    window.location.href = '/planocontas';
  } catch (error) {
    dw3ExibirMensagem('planoContaAlert', mensagemDeErro(error, 'Erro ao atualizar a conta.'), 'danger');
  } finally {
    btnAtualizar.disabled = false;
  }
}

// Consome a API deletePlanoConta (soft delete).
async function vwDeletePlanoConta() {
  var btnRemover = document.getElementById('btnRemoverPlanoConta');

  if (btnRemover.disabled) {
    return;
  }

  var descricao = document.getElementById('codigo').value + ' - ' + document.getElementById('descricao').value;

  if (!window.confirm('Confirma a remoção da conta "' + descricao + '"?')) {
    return;
  }

  btnRemover.disabled = true;

  try {
    var id = document.getElementById('planocontaid').value;

    var data = await dw3Requisicao(obterServidorPlanoContas() + '/deletePlanoConta/' + encodeURIComponent(id), {
      method: 'DELETE'
    });

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover a conta.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma conta foi removida.');
    }

    dw3SalvarAviso('Conta removida com sucesso.', 'success');
    window.location.href = '/planocontas';
  } catch (error) {
    dw3ExibirMensagem('planoContaAlert', mensagemDeErro(error, 'Erro ao remover a conta.'), 'danger');
    btnRemover.disabled = false;
  }
}
