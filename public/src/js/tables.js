$(document).ready(function () {
  var table = $("#table_produtos").DataTable({
    paging: true,
    responsive: true,
    language: {
      search: `<span id="search-prod-filter" class="material-symbols-outlined">
      search
      </span>`,
      searchPlaceholder: "Pesquisar produtos",
    },
    fnDrawCallback: function (oSettings) {
      $(".dataTables_filter input").attr("id", "input-search-prod");
    },
  });

  function adcElemento() {
    var tableSearch = document.getElementById("table_produtos_filter");
    var btnAddprod = document.createElement("a");
    btnAddprod.textContent = "Add produtos";

    btnAddprod.classList.add("btn-addProd");
    var svgA = document.createElement("span");
    svgA.classList.add("material-symbols-outlined");
    svgA.textContent = "add_circle";
    btnAddprod.onclick = function (event) {
      event.preventDefault();
      $("#container-add-products").show();
      $(window).bind("scroll", 0);
    };
    const closeBtnAddprod = document.getElementById("closeBtn");
    closeBtnAddprod.onclick = function (event) {
      event.preventDefault();
      $("#container-add-products").hide();
    };

    btnAddprod.insertBefore(svgA, btnAddprod.lastElementChild);
    tableSearch.insertBefore(btnAddprod, tableSearch.firstChild);
  }
  adcElemento();

  const btn = document.getElementById("btnAddForm");

  const removerModal = {
    success: function () {
      setTimeout(() => {
        console.log("teste success");
        $("#alertSuccess").css({
          opacity: "0",
          transition: "all 1s",
        });
      }, 1000);
      setTimeout(() => {
        console.log("teste success");
        $("#alertSuccess").css({
          display: "none",
        });
      }, 2000);
    },
    error: function () {
      setTimeout(() => {
        console.log("teste error");
        $("#alertError").css({
          opacity: "0",
          transition: "all 1s",
        });
      }, 1000);
      setTimeout(() => {
        console.log("teste success");
        $("#alertError").css({
          display: "none",
        });
      }, 2000);
    },
  };

  btn.addEventListener("click", removerModal["success"]());
  btn.addEventListener("click", removerModal["error"]());

  $("#input-search-prod").keyup(function (e) {
    e.preventDefault();
    $("#search-prod-filter").css("display", "none");
    var inputSearchProd = $("#input-search-prod").val();
    console.log(inputSearchProd.length);
    if (inputSearchProd == "") {
      $("#search-prod-filter").css("display", "block");
    }
  });
});

// ========= Início da Função Editar Produto =========

var tr = document.querySelectorAll(".edit-btn");
tr.forEach((el) => {
  el.addEventListener("click", (result) => {
    $("#containerEdit").show();
    $(window).bind("scroll", 0);
    var dadosProd = result.target.parentElement.parentElement.children;

    console.log(dadosProd[7].innerText)

    $("#id").val(dadosProd[0].innerText);
    var srcImage = dadosProd[1].children[0].src.replace(location.href.split('/estoque')[0], '')
    $("#imagemInputEdit").attr('src', srcImage)
    $("#eanEdit").val(dadosProd[2].innerText);
    $("#nomeEdit").val(dadosProd[3].innerText);
    if (dadosProd[4].innerText == 'Sem Descrição') {
      $("#descricaoEdit").val('');
    } else {
      $("#descricaoEdit").val(dadosProd[4].innerText);
    }
    $("#quantidadeEdit").val(dadosProd[5].innerText);
    $("#precoEdit").val(dadosProd[6].innerText);
    $("#categorias").each(function (a, b) {
      for (var i = 0; i < b.children.length; i++) {
        if (dadosProd[7].innerText == b.children[i].text) {
          console.log(i + 1)
          $("#categorias").val(i + 1)
        }
      }
    })
  });
});

$("#closeEdit").click(function () {
  $("#containerEdit").hide();
  $(window).bind("scroll", 0);
});

// ============= Fim da função Editar =============


// ========= Início da Função Deletar Produto =========
function delProd(ean) {
  console.log(ean)
  $(".modal-confirm-deleteProd").css({
    display: "flex",
  });

  $(".modal-confirm-deleteProd").show();
  $(window).bind("scroll", 0);
  $(".btn-delete-prod").attr('href', '/del-product?ean=' + ean)
}

// ========= Fim da Função Deletar =========

// ========= Função de Mostrar a Imagem Selecionada =========

const inputFile = document.getElementById("fileFoto");
const inputFileEdit = document.getElementById("fileFotoEdit")
const picture = document.getElementById("imagemInput");
const pictureEdit = document.getElementById("imagemInputEdit")

inputFile.addEventListener("change", function (event) {
  const inputTarget = event.target;
  const file = inputTarget.files[0];

  if (file) {
    const reader = new FileReader();

    reader.addEventListener("load", (ev) => {
      const readerTarget = ev.target;
      picture.src = readerTarget.result;
    });

    reader.readAsDataURL(file);
  }
});

inputFileEdit.addEventListener("change", function (event) {
  const inputTarget = event.target;
  const file = inputTarget.files[0];

  if (file) {
    const reader = new FileReader();

    reader.addEventListener("load", (ev) => {
      const readerTarget = ev.target;
      pictureEdit.src = readerTarget.result;
    });

    reader.readAsDataURL(file);
  }
});

// ========= Fim da Função de Mostrar Imagem =========