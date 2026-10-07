// Arquivo: apps/home/vwHome.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) { // Função em public/js/dw3frontend.js que verifica se o usuário está logado.
    return;
  }

  carregarResumo();
});

// Usa a API getAllLancamentos para montar o resumo de receitas, despesas e saldo.
async function carregarResumo() {
  var servidorDw3 = document.getElementById('homeResumo').dataset.servidorDw3;

  try {
    var data = await dw3Requisicao(servidorDw3 + '/getAllLancamentos');
    var receitas = 0;
    var despesas = 0;

    (data.registro || []).forEach(function(lancamento) {
      if (lancamento.tipo === 'Receita') {
        receitas += Number(lancamento.valor);
      } else {
        despesas += Number(lancamento.valor);
      }
    });

    var saldo = receitas - despesas;
    var elSaldo = document.getElementById('totalSaldo');

    document.getElementById('totalReceitas').textContent = dw3FormatarMoeda(receitas);
    document.getElementById('totalDespesas').textContent = dw3FormatarMoeda(despesas);
    elSaldo.textContent = dw3FormatarMoeda(saldo);
    elSaldo.classList.add(saldo >= 0 ? 'text-success' : 'text-danger');
  } catch (error) {
    dw3ExibirMensagem('homeAlert', error instanceof TypeError
      ? 'Não foi possível conectar ao servidor backend.'
      : error.message, 'danger');
  }
}
