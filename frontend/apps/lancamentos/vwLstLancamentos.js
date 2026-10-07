// arquivo: apps/lancamentos/vwLstLancamentos.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('lancamentosListagem');

  if (!listagem) {
    return;
  }

  dw3ExibirAvisoPendente('lancamentosAlert');
  configurarOperacoesLancamentos();
  vwGetAllLancamentos(listagem.dataset.servidorDw3);
});

// Consome a API getAllLancamentos e preenche a tabela e os totais.
async function vwGetAllLancamentos(servidorDw3) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var data = await dw3Requisicao(servidorDw3 + '/getAllLancamentos');

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    atualizarTotais(data.registro);
    inicializarTabelaLancamentos(data.registro);
  } catch (error) {
    dw3ExibirMensagem('lancamentosAlert', error instanceof TypeError
      ? 'Não foi possível conectar ao servidor backend.'
      : error.message || 'Erro ao carregar os lançamentos.', 'danger');
    inicializarTabelaLancamentos([]);
  }
}

function atualizarTotais(lancamentos) {
  var receitas = 0;
  var despesas = 0;

  lancamentos.forEach(function(lancamento) {
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
}

function inicializarTabelaLancamentos(lancamentos) {
  new DataTable('#tblLancamentos', {
    data: lancamentos,
    order: [[1, 'desc']],
    columns: [
      { data: 'lancamentoid', defaultContent: '' },
      {
        data: 'datalancamento',
        defaultContent: '',
        render: function(data, type) {
          // Para ordenar usa a data AAAA-MM-DD; para exibir, DD/MM/AAAA.
          return type === 'display' ? dw3FormatarData(data) : data;
        }
      },
      { data: 'descricao', defaultContent: '' },
      {
        data: null,
        defaultContent: '',
        render: function(data, type, row) {
          return (row.codigo || '') + ' - ' + (row.contadescricao || '');
        }
      },
      {
        data: 'tipo',
        defaultContent: '',
        render: function(data, type) {
          if (type !== 'display') {
            return data;
          }
          var cor = data === 'Receita' ? 'text-bg-success' : 'text-bg-danger';
          return '<span class="badge ' + cor + '">' + dw3EscaparHtml(data || '') + '</span>';
        }
      },
      {
        data: 'valor',
        defaultContent: '',
        className: 'text-end',
        render: function(data, type) {
          return type === 'display' ? dw3FormatarMoeda(data) : Number(data);
        }
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function(data, type, row) {
          if (type !== 'display') {
            return '';
          }

          var id = dw3EscaparHtml(row.lancamentoid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do lançamento">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-id="' + id + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-id="' + id + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-id="' + id + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    language: dw3DataTablesPtBr
  });
}

// Os botões da tabela abrem o formulário com a operação: Re (visualizar), Up (atualizar), De (remover).
function configurarOperacoesLancamentos() {
  var tabela = document.getElementById('tblLancamentos');

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-id]');

    if (!botao) {
      return;
    }

    var operacoes = { visualizar: 'Re', atualizar: 'Up', remover: 'De' };
    var oper = operacoes[botao.dataset.action];

    window.location.href = '/lancamentos/form?oper=' + oper + '&id=' + encodeURIComponent(botao.dataset.id);
  });
}
