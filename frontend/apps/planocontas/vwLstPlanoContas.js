// arquivo: apps/planocontas/vwLstPlanoContas.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('planoContasListagem');

  if (!listagem) {
    return;
  }

  dw3ExibirAvisoPendente('planoContasAlert');
  configurarOperacoesPlanoContas();
  vwGetAllPlanoContas(listagem.dataset.servidorDw3);
});

// Consome a API getAllPlanoContas e preenche a tabela.
async function vwGetAllPlanoContas(servidorDw3) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var data = await dw3Requisicao(servidorDw3 + '/getAllPlanoContas');

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaPlanoContas(data.registro);
  } catch (error) {
    dw3ExibirMensagem('planoContasAlert', error instanceof TypeError
      ? 'Não foi possível conectar ao servidor backend.'
      : error.message || 'Erro ao carregar o plano de contas.', 'danger');
    inicializarTabelaPlanoContas([]);
  }
}

function inicializarTabelaPlanoContas(contas) {
  new DataTable('#tblPlanoContas', {
    data: contas,
    order: [[1, 'asc']],
    columns: [
      { data: 'planocontaid', defaultContent: '' },
      { data: 'codigo', defaultContent: '' },
      { data: 'descricao', defaultContent: '' },
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
        data: 'ativo',
        defaultContent: '',
        render: function(data, type) {
          if (type !== 'display') {
            return data ? 'Ativa' : 'Inativa';
          }
          return data
            ? '<span class="badge text-bg-primary">Ativa</span>'
            : '<span class="badge text-bg-secondary">Inativa</span>';
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

          var id = dw3EscaparHtml(row.planocontaid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações da conta">',
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
function configurarOperacoesPlanoContas() {
  var tabela = document.getElementById('tblPlanoContas');

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-id]');

    if (!botao) {
      return;
    }

    var operacoes = { visualizar: 'Re', atualizar: 'Up', remover: 'De' };
    var oper = operacoes[botao.dataset.action];

    window.location.href = '/planocontas/form?oper=' + oper + '&id=' + encodeURIComponent(botao.dataset.id);
  });
}
