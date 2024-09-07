// Validador do código ean passado
function checarTinput() {
    const codigo = document.getElementById("codigo");
    const Icodigo = codigo.value.trim().toUpperCase();

    //var tamanhoCaracteres = 13;
    const calcseparador = /^(\d{0,})?(X\d{13})?$/.exec(Icodigo);

    // Verificador de tamanho
    if (calcseparador && (calcseparador[2] && calcseparador[2].length === 14 || Icodigo.length === 13)) {
        const quantidadeA = calcseparador[1] ? parseInt(calcseparador[1], 10) : 1;
        const codigoA = calcseparador[2] ? calcseparador[2].substring(1) : Icodigo;

        // Cria um novo card com os valores
        if (quantidadeA == codigoA) {
            const quantidadeA = 1
            verificarExApi(quantidadeA, codigoA);
        } else {
            verificarExApi(quantidadeA, codigoA);
        }

        // Limpa o campo de entrada após criar o card
        codigo.value = "";
    }
}

function vizualizarImg(Urlimagem) {
    document.getElementById("vizualizaImgProd").innerHTML =
        '<img src="' + 'https' + Urlimagem.split('https')[1] + '" alt="Imagem do Produto" class="form-img-prod">'
}

// Verificador de Existência // Não pode ser um número que não exista e nenhum vazio
function verificarExApi(quantidadeA, codigoA) {//, Ipreco, Iquantidade
    if (codigoA && codigoA.trim() !== '') {
        fetch(`http://localhost:5464/v1/api/produtos/${codigoA}`)
            .then(response => response.json())
            .then(data => {

                console.log(data.produtoConsultado.ean);
                console.log(codigoA)

                if (codigoA.toString() === data.produtoConsultado.ean) {
                    // Gera o card de vendas geral
                    gerarCard(data.produtoConsultado.nomeproduto, data.produtoConsultado.ean, data.produtoConsultado.valor, quantidadeA);
                    // Vizualizador de Imagem
                    vizualizarImg(data.produtoConsultado.image)
                    // Gera o vizualizador do último produto passado
                    document.getElementById("vizualizaProd").innerHTML =
                        '<div id="displayValues" class="al-f-dados"></div>' +
                        '<div class="vizualizar-dados">' +
                        '<div class="al-f-dados">' +
                        '<h1 class="nome-ad-prod font-nome"><b> ' + data.produtoConsultado.nomeproduto + '</b></h1>' +
                        '<h2 class="nome-ad-prod"><b>Código: ' + data.produtoConsultado.ean + '</b></h2>' +
                        '<h2 class="nome-ad-prod"><b>Preço: ' + data.produtoConsultado.valor + '</b></h2>' +
                        '<h2 class="nome-ad-prod"><b>Quantidade: ' + quantidadeA + '</b></h2>' +
                        '<br>' +
                        '<br>' +
                        '<h2 class="nome-ad-prod"><b>Descrição: ' + data.produtoConsultado.descricao + '</b></h2>' +
                        '</div>' +
                        '</div>';
                } else {
                    // Produto não encontrado, exibe um alerta personalizado
                    // alert('Produto com código ' + codigoA + ' não encontrado na API.');
                    console.log('tttttttttttttttttt')
                    alert('Insira um produto válido!');
                }
            })
            .catch(error => console.error('Erro:', error));
    } else {
        // Valor de codigoA é inválido ou vazio, exibe um alerta
        alert('Por favor, insira um valor válido no input.');
    }
}

