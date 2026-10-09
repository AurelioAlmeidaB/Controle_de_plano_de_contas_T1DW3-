// arquivo: ./apps/lancamentos/vwLstLancamentos.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('lancamentosListagem');
  var alertBox = document.getElementById('lancamentosAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesLancamentos();
  vwGetAllLancamentos(servidorDw3, alertBox);
});

async function vwGetAllLancamentos(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllLancamentos', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a lista de lançamentos.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaLancamentos(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar lançamentos.');
    inicializarTabelaLancamentos([]);
  }
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
          if (!data || type !== 'display') {
            return data || '';
          }

          return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
        }
      },
      { data: 'descricao', defaultContent: '' },
      {
        data: null,
        defaultContent: '',
        render: function(data, type, row) {
          return row.codigo + ' - ' + row.contadescricao;
        }
      },
      { data: 'tipo', defaultContent: '' },
      {
        data: 'valor',
        defaultContent: '',
        render: function(data, type) {
          if (data === null || data === undefined || data === '') {
            return '';
          }

          if (type !== 'display') {
            return Number(data);
          }

          return Number(data).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
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

          var lancamentoId = escaparHtml(row.lancamentoid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do lançamento">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-lancamentoid="' + lancamentoId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-lancamentoid="' + lancamentoId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-lancamentoid="' + lancamentoId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    language: {
      emptyTable: 'Nenhum lançamento cadastrado.',
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
    }
  });
}

function configurarOperacoesLancamentos() {
  var tabela = document.getElementById('tblLancamentos');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-lancamentoid]');

    if (!botao) {
      return;
    }

    var operacoes = { visualizar: 'Re', atualizar: 'Up', remover: 'De' };
    var oper = operacoes[botao.dataset.action];

    if (oper) {
      window.location.href = '/lancamentos/form?oper=' + oper + '&lancamentoId=' + encodeURIComponent(botao.dataset.lancamentoid);
    }
  });
}

function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function exibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('alert-info');
  alertBox.classList.add('alert-danger');
  alertBox.classList.remove('d-none');
}
