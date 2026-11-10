// VARIÁVEL GLOBAL QUE FALTAVA DECLARAR
let colecaoMidia = [];
let idItemSendoEditado = null; 

//  CARREGAR DADOS (DO LOCALSTORAGE OU DO ARQUIVO JSON INICIAL)
async function carregarCatalogo() {
  const container_card = document.getElementById('catalogo-grid');
  container_card.innerHTML = `<p>Carregando itens, aguarde...</p>`;
  try {
    const dadosLocais = localStorage.getItem('dadosMidia');
    if (dadosLocais) {
      colecaoMidia = JSON.parse(dadosLocais);
    } else {
      const resposta = await fetch('dados.json');
      if (!resposta.ok) throw new Error('Não foi possível carregar o arquivo dados.json de fábrica.');
      colecaoMidia = await resposta.json();
      localStorage.setItem('dadosMidia', JSON.stringify(colecaoMidia));
    }
    rendenizarGrid(colecaoMidia);
    configurarFiltros();
  } catch (erro) {
    container_card.innerHTML = `<p style="color: #ef4444;">Erro ao carregar catálogo: ${erro.message}</p>`;
    console.error(erro);
    configurarFiltros();
  }
}

//  RENDERIZAR OS CARDS COM DESIGN CLEAN E MODERNIZADO
function rendenizarGrid(lista) {
  const container = document.getElementById('catalogo-grid');
  container.innerHTML = '';
  
  if (lista.length === 0) {
    container.innerHTML = `<p class="info" style="grid-column: 1/-1; text-align: center; padding: 20px;">Nenhum item cadastrado nesta categoria</p>`;
    return;
  }
  
  lista.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const notaFormatada = Number(item.nota).toFixed(1);
    const urlCapa = item.capa || 'https://unsplash.com';
    
    // BOTÃO DE EDITAR ADICIONADO AQUI DENTRO DO CARD-CONTENT
    card.innerHTML = `
      <div class="capa-container">
        <img src="${urlCapa}" alt="${item.titulo}" class="capa-midia">
      </div>
      <div class="card-content" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        <div>
          <span class="tag-categoria">${item.categoria}</span>
          <h3>${item.titulo}</h3>
          <p class="info">Plataforma: <strong>${item.plataforma}</strong></p>
          <p class="info">Status: <strong class="status-badge" onclick="alterarStatus('${item.id}')" style="cursor:pointer;">${item.status || 'Disponível'}</strong></p>
          <div class="nota-container" style="margin-bottom: 15px;">
            <i class="fa-solid fa-star"></i>
            <span>${notaFormatada}</span>
          </div>
        </div>
        
        <!-- CONTAINER PARA OS DOIS BOTÕES COEXISTIREM LADO A LADO -->
        <div style="display: flex; gap: 8px; margin-top: auto;">
          
          <!-- NOVO: BOTÃO DE EDITAR -->
          <button onclick="carregarParaEdicao('${item.id}')" style="flex: 1; background-color: #0ea5e9; color: #f8fafc; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;" onmouseover="this.style.backgroundColor='#0284c7'" onmouseout="this.style.backgroundColor='#0ea5e9'">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>

          <!-- BOTÃO DE EXCLUIR -->
          <button onclick="excluirItem('${item.id}')" style="flex: 1; background-color: #334155; color: #f8fafc; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;" onmouseover="this.style.backgroundColor='#ef4444'" onmouseout="this.style.backgroundColor='#334155'">
            <i class="fa-solid fa-trash-can"></i> Excluir
          </button>
          
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

//  EVENTO DO FORMULÁRIO UNIFICADO (CRIAÇÃO + EDIÇÃO EM UM SÓ)
document.getElementById('form-midia').addEventListener('submit', function(evento) {
  evento.preventDefault();
  
  const titulo = document.getElementById('titulo').value;
  const imagemUrl = document.getElementById('imagemUrl').value;
  const categorySelect = document.getElementById('categoria');
  const categoria = categorySelect ? categorySelect.value : '';
  const plataforma = document.getElementById('plataforma').value;
  const nota = parseFloat(document.getElementById('nota').value);
  
  // Converte idItemSendoEditado para String se não for nulo para evitar erros de tipo
  if (idItemSendoEditado !== null) {
    const itemIndex = colecaoMidia.findIndex(m => String(m.id) === String(idItemSendoEditado));
    
    if (itemIndex !== -1) {
      colecaoMidia[itemIndex].titulo = titulo;
      colecaoMidia[itemIndex].capa = imagemUrl;
      colecaoMidia[itemIndex].categoria = categoria;
      colecaoMidia[itemIndex].plataforma = plataforma;
      colecaoMidia[itemIndex].nota = nota;
    }
    
    idItemSendoEditado = null;
    const botaoAdicionar = this.querySelector('button[type="submit"]');
    if (botaoAdicionar) botaoAdicionar.textContent = 'Adicionar';
    alert('Item atualizado com sucesso!');
    
  } else {
    // Modo de criação normal
    const novoItem = {
      id: String(Date.now()), // Salvando id como String para bater com a busca da edição
      titulo: titulo,
      categoria: categoria,
      plataforma: plataforma,
      nota: parseFloat(nota),
      status: categoria === "Jogos" ? "Jogado" : "Assistido",
      capa: imagemUrl
    };
    colecaoMidia.push(novoItem);
    alert('Item adicionado à lista local com sucesso!');
  }
  
  localStorage.setItem('dadosMidia', JSON.stringify(colecaoMidia));
  rendenizarGrid(colecaoMidia);
  this.reset();
});

//  PUXA OS DADOS DO CARD PARA O FORMULÁRIO
function carregarParaEdicao(id) {
  const item = colecaoMidia.find(m => String(m.id) === String(id));
  if (!item) return;
  
  document.getElementById('titulo').value = item.titulo;
  document.getElementById('imagemUrl').value = item.capa || '';
  if (document.getElementById('categoria')) document.getElementById('categoria').value = item.categoria;
  document.getElementById('plataforma').value = item.plataforma || '';
  document.getElementById('nota').value = item.nota;
  
  idItemSendoEditado = id;
  
  const botaoAdicionar = document.querySelector('#form-midia button[type="submit"]');
  if (botaoAdicionar) {
    botaoAdicionar.textContent = 'Salvar Alterações';
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

//  CONFIGURAR OS BOTÕES DE FILTRO
function configurarFiltros() {
  const botoes = document.querySelectorAll('.filtros button');
  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      const categoriaSelecionada = botao.textContent.trim();
      if (categoriaSelecionada === 'Todos') {
        rendenizarGrid(colecaoMidia);
      } else {
        const listaFiltrada = colecaoMidia.filter(item => {
          const catItem = item.categoria.toLowerCase();
          const catBotao = categoriaSelecionada.toLowerCase();
          return catItem.startsWith(catBotao.substring(0, 4));
        });
        rendenizarGrid(listaFiltrada);
      }
    });
  });
}

//  ALTERAR STATUS SEQUENCIALMENTE
async function alterarStatus(id) {
  const item = colecaoMidia.find(m => String(m.id) === String(id));
  if(!item) return;
  
  const statusOpcoes = ["Jogar", "Jogando", "Jogado", "Assistir", "Assistindo", "Assistido"];
  const indexAtual = statusOpcoes.indexOf(item.status);
  const proximoStatus = statusOpcoes[(indexAtual + 1) % statusOpcoes.length];
  
  try {
    item.status = proximoStatus;
    localStorage.setItem('dadosMidia', JSON.stringify(colecaoMidia));
    rendenizarGrid(colecaoMidia);
  } catch(erro) {
    alert("Erro ao atualizar o status");
  }
}

//  FUNÇÃO PARA EXCLUIR O CARD COMPLETO
function excluirItem(id) {
  const item = colecaoMidia.find(m => String(m.id) === String(id));
  if (!item) {
    alert("Item não encontrado para exclusão.");
    return;
  }
  if (confirm(`Deseja realmente apagar o card de "${item.titulo}" e remover tudo?`)) {
    colecaoMidia = colecaoMidia.filter(m => String(m.id) !== String(id));
    localStorage.setItem('dadosMidia', JSON.stringify(colecaoMidia));
    rendenizarGrid(colecaoMidia);
  }
}

// Inicia o processo
document.addEventListener('DOMContentLoaded', carregarCatalogo);
