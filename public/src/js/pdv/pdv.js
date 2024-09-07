//import "../../../../views/pdv.ejs"

var contadorCards = 0;
var totalPreco = 0;
var cards = {};//

function gerarCard(nome, ean, preco, quantidade, isLocalStorageData) { // depois adiciono quantidade
  //var codigo = document.getElementById("codigo").value;

  // Validar se o código é não vazio
  if (ean.trim() === '') {
    alert("Por favor, insira um código válido.");
    return;
  }
  var precoU = parseFloat(String(preco).replace(",", "."));
  var quantidadeT = parseFloat(quantidade);
  var ValorTotalCard = precoU * quantidadeT;
  totalPreco += ValorTotalCard;

  if (cards[ean]) {
    // Se o card com o mesmo código já existe, atualiza as informações
    var cardExistente = cards[ean];
    cardExistente.quantidade += quantidadeT;
    cardExistente.valorTotal += ValorTotalCard;
    cardExistente.elemento.querySelector("#quantidadeE").textContent = "Quantidade: " + cardExistente.quantidade;
    cardExistente.elemento.querySelector("#precoE").textContent = "Valor Total: R$" + cardExistente.valorTotal.toFixed(2);
  } else {
    // Se o card com o mesmo código não existe, cria um novo card
    contadorCards++;
    var novoCard = document.createElement("div");
    novoCard.id = "card" + contadorCards;
    novoCard.innerHTML =
      "<div class='produto-single-store'>" +
      "<br>" +
      "<span id='nomeE' class='nome-produto-compra' >" + nome + "</span>" +
      "<span id='codigoE'>Código: " + ean + "</span>" +
      "<div class='dados-compra-single'>" +
      "<span id='quantidadeE'>Quantidade: " + quantidade + "</span>" +
      "<span id='precoE'>Valor Total: R$" + ValorTotalCard.toFixed(2) + "</span>" +
      "<div class='btn-comp-al'>" +
      "<button class='btn-excluir' onclick='excluirCard(" + contadorCards + ")'><span class='material-symbols-outlined'>delete</span></button>" +
      "</div>" +
      "</div>" +
      "</div>";

    document.getElementById("cardsContainer").appendChild(novoCard);
    cards[ean] = { quantidade: quantidadeT, valorTotal: ValorTotalCard, elemento: novoCard };
  }

  atualizarTotal();
  document.getElementById("codigo").value = "";
  if (!isLocalStorageData) {
    salvarCardsNoLocalStorage();
    atualizarTotal()
  }

}

function limparCards() {
  // Limpar os cards existentes
  document.getElementById("cardsContainer").innerHTML = "";
  totalPreco = 0;
  cards = {};
  atualizarTotal();
}

function atualizarTotal() {
  document.getElementById("totalPreco").innerHTML = "Total: R$" + totalPreco.toFixed(2);
  document.getElementById("precoFinalModal").innerHTML = "R$ " + totalPreco.toFixed(2);
  document.getElementById("precoFinalTotal").innerHTML = "R$ " + totalPreco.toFixed(2);
}

function excluirCard(cardID) { // Preciso remover o item da tela e o item do local storage
  var card = document.getElementById("card" + cardID);
  card.remove();
  salvarCardsNoLocalStorage()
  atualizarTotal()
  location.reload();
  //localStorage.removeItem(card)
}
// Fazer o input ficar sempre selecionado
var time = false
function focar() {
  var codigoEleF = document.getElementById("codigo")
  if (time === false) {
    codigoEleF.focus()
  }
}
console.log(time)
setInterval(focar, 500)


// Modal finalizar Compra
function abrirModalfinalizar() {
  //console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")
  time = true
  var overlay = document.getElementById('overlay2');
  var modal = document.getElementById('modalfinalizar');
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

function fecharModalfinalizar() {
  time = false
  var overlay = document.getElementById('overlay2');
  var modal = document.getElementById('modalfinalizar');
  overlay.style.display = 'none';
  modal.style.display = 'none';
}

//Modal cancelar Compra
function abrirModalcancelar() {
  var overlay = document.getElementById('overlay3');
  var modal = document.getElementById('modalcancelar');
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

function fecharModalcancelar() {
  var overlay = document.getElementById('overlay3');
  var modal = document.getElementById('modalcancelar');
  overlay.style.display = 'none';
  modal.style.display = 'none';
}

function mensagemFFinaliza() {
  const overlay = document.getElementById('overlay-final');
  const mensagemElemento = document.getElementById('mensagem');
  overlay.style.display = 'block';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 5000);
}

function mensagemCCancela() {
  const overlay2 = document.getElementById('overlay-final-2');
  const mensagemElemento = document.getElementById('mensagem-2');
  overlay2.style.display = 'block';
  setTimeout(() => {
    overlay2.style.display = 'none';
  }, 5000);
}

function cancelarCompra(finaliza) {
  if (finaliza) {
    //localStorage.clear() // Depois dar uma olhada para adicionar um remove item
    //var dados = localStorage.getItem("dados")
    localStorage.removeItem("dados")
    //delete dados[i]
    // Mensagem
    mensagemFFinaliza()
    // Recarregar a página
    //location.reload()
    //alert("Nota Emitida!")
  } else {
    //localStorage.clear()
    localStorage.removeItem("dados")
    // Recarregar a página
    //alert("Compra Cancelada!")
    mensagemCCancela()
    fecharModalcancelar()
    //location.reload()
  }
  limparTodosOsCards()
  //location.reload()
  //window.location.href = './views/pdv'
  //alert(".")
}

//Soma Preços // Modal
// Apresentar Valor total assim que for bipado
document.getElementById("somaPrecos").innerHTML =
  '<div class="info-total-descontos">' +
  '<span id="totalPreco" class="total-produtos">Total: R$ 0.00</span>' +
  '<span>Descontos:</span>' +
  '<span></span>' +
  '</div>';

//Modal venda
document.getElementById("precoTot").innerHTML =
  '<div class="modal-c">' +
  '<div>' +
  '<label for="codigo" class="label-modal-fin-venda">Preço Total:</label>' +
  '</div>' +
  '<div>' +
  '<label id="precoFinalModal" class="label-modal-fin-venda"> R$ ---,--</label>' +
  '</div>' +
  '</div>';
document.getElementById("descontoTot").innerHTML =
  '<div class="modal-c">' +
  '<label for="preco"  class="label-modal-fin-venda">Desconto:</label>' +
  '<label class="label-modal-fin-venda"> ---,-- %</label>' +
  '</div>';
document.getElementById("precoFin").innerHTML =
  '<div class="modal-c">' +
  '<label for="quantidade" class="label-modal-fin-venda">Preço Final: </label>' +
  '<label id="precoFinalTotal" class="label-modal-fin-venda">R$ ---,--</label>' +
  '</div>';
document.getElementById("formaPag").innerHTML =
  '<div class="modal-c">' +
  '<label for="formPag" class="label-modal-fin-venda">Forma de Pagamento:   </label>' +
  '<select id="formpagmt" name="form_pagamento" style="border-width: 1px; border-radius: 5px;">' +
  '<option value="1">PIX</option>' +
  '<option value="2">Crédito</option>' +
  '<option value="3">Débito</option>' +
  '<option value="4">Espécie</option>' +
  '</select>' +
  '</div>';
document.getElementById("parcelas").innerHTML =
  '<div class="modal-c">' +
  '<label for="parcPag" class="label-modal-fin-venda">Quantidade de Parcelas:</label>' +
  '<select id="parcPagt" name="parcelas" style="border-width: 1px; border-radius: 5px;">' +
  '<option value="umP">1x</option>' +
  '<option value="doisP">2x</option>' +
  '<option value="tresP">3x</option>' +
  '<option value="quatroP">4x</option>' +
  '</select>' +
  '</div>';
document.getElementById("cpfnota").innerHTML =
  '<div class="modal-c">' +
  '<label for="parcPag" class="label-modal-fin-venda">Cpf na Nota?</label>' +
  '<input type="text" id="cpfInput" maxlength="11" placeholder="CPF (opcional)" style="border-width: 1px; border-radius: 5px; font: 25.6px">' +
  '</div>';

function salvarCardsNoLocalStorage() {
  var cardsContainer = document.getElementById('cardsContainer');
  var cards = cardsContainer.getElementsByClassName('produto-single-store');
  var product = [];

  // Mapear os cards para um array de objetos
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var nome = card.querySelector('.nome-produto-compra').textContent;
    var ean = card.querySelector('#codigoE').textContent.replace('Código: ', '');
    var quantidade = parseInt(card.querySelector('#quantidadeE').textContent.replace('Quantidade: ', ''));
    var preco = parseFloat(card.querySelector('#precoE').textContent.replace('Valor Total: R$', '').trim());
    var precoUnitario = (preco / quantidade).toFixed(2)
    // Se eu quiser passar o nome basta adicionar o nome aqui
    product.push({ nome: nome, ean: ean, qnt: quantidade, precounitario: precoUnitario, valor: preco.toFixed(2) });
  }

  // Calcular o valor total
  var valorTotal = totalPreco.toFixed(2);

  let cpfDigitado;

  document.getElementById('cpfInput').addEventListener('input', function () {
    let cpfDigitado = this.value;
    if (!isNaN(cpfDigitado)) {
      cpfDigitado = parseInt(cpfDigitado);
      console.log("O cpf digitado foi: ", cpfDigitado)
    }

    console.log("O cpf é: ", cpfDigitado)
    // Criar o objeto final
    var dadosParaSalvar = {
      product,
      valorTotal,
      cpf: cpfDigitado
    };

    // Salvar os dados no localStorage
    localStorage.setItem('dados', JSON.stringify(dadosParaSalvar));
  });

  var dadosParaSalvar = {
    product,
    valorTotal,
    cpf: cpfDigitado
  };
  localStorage.setItem('dados', JSON.stringify(dadosParaSalvar));
}


/////////////////////////////////////
function carregarCardsDoLocalStorage() {
  var dadosArmazenados = JSON.parse(localStorage.getItem('dados')) || {};

  // Carregar os cards do localStorage
  if (dadosArmazenados.product) {
    dadosArmazenados.product.forEach(function (cardData) {
      gerarCard(cardData.nome, cardData.ean, cardData.valor, cardData.qnt, true);
    });
  }

  // Carregar totalPreco do localStorage
  if (dadosArmazenados.totalPreco) {
    totalPreco = dadosArmazenados.totalPreco;
    atualizarTotal();
  }
}

// Chamar a função para carregar os cards ao carregar a página
carregarCardsDoLocalStorage();

function limparTodosOsCards() {
  var cardsContainer = document.getElementById("cardsContainer");
  var vizualizadorw = document.getElementById("vizualizaProd")
  var vizualizaimg = document.getElementById("vizualizaImgProd")

  // Remover todos os cards
  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }

  while (vizualizadorw.firstChild) {
    vizualizadorw.removeChild(vizualizadorw.firstChild)
  }

  while (vizualizaimg.firstChild) {
    vizualizaimg.removeChild(vizualizaimg.firstChild)
  }

  // Atualizar o total
  totalPreco = 0;
  atualizarTotal();

  // Salvar o estado atual no localStorage
  salvarCardsNoLocalStorage();
}

/**/
//Teste Retorno de dados local para um db básico em json:

function emitirNota() {
  try {
    var inputCpf = document.getElementById('cpfInput');
    inputCpf.value = '';
    const itens = localStorage.getItem('dados')
    console.log(itens)
    if (itens) {
      const dados = JSON.parse(itens)
      if (dados.product) {
        dados.product.forEach(function (item) {
          delete item.nome
        })
      }

      const formaPagSel = document.getElementById('formpagmt')
      dados.form_pagamento = formaPagSel.value
      console.log('A forma de pagamento: ', dados.form_pagamento)
      //delete dados.id
      //console.log(`dados: ${dados}`)
      //const linkAPI = 'http://localhost:5001' // Caminho inverso do retorno de informações ao vender o produto // executar serverT
      const linkAPI = 'http://localhost:5464/v1/api'
      console.log('Dados' + JSON.stringify(dados))
      const configOp = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': 'BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkxvcHBlc0B0ZXN0ZS5jb20iLCJ1c2VybmFtZSI6IkxvcHBlcyIsImlhdCI6MTcwMjk5OTQxOSwiZXhwIjoxNzAzMDg1ODE5fQ.NZlOCZTcTyGFsteYN5aDSnh_H3VIt0d73fWYH64OM50',
        },
        body: JSON.stringify(dados),

        //body: JSON.stringify(dados),
      };
      console.log("Dados a caminho:  ", configOp)
      fetch(linkAPI + '/sell-product', configOp) // "/dados"
        .then(res => {
          console.log(res)

          if (!res.ok) {
            throw new Error('Erro no envio de dados!!!!')
          }
          return res.json();
        })
        .then(data => {
          console.log(data)
        })
        .catch(erro => {
          console.log(`Erro ao enviar os dados ${erro}`)
        })
    } else {
      console.log('Deu erro nos dados, eles não tão no localstorage')
    }
    fecharModalfinalizar()
    limparCards()
    cancelarCompra(true)
  } catch (error) {
    console.log(`Erro no envio ao servidor: ${error}`)
  }
}