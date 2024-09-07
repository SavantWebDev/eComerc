function addCliente() {
  const btnAdd = document.querySelector("#btn__add--cliente");
  const btnClose = document.querySelector("#closeBtn");
  console.log(btnAdd);
  btnAdd.addEventListener("click", (event) => {
    event.preventDefault();
    $("#container-add-user").show();
    $(window).bind("scroll", 0);
  });
  btnClose.addEventListener("click", (event) => {
    event.preventDefault();
    $("#container-add-user").hide();
  });
}

addCliente();

$("#closeEdit").click(function () {
  $("#containerEdit").hide();
  $(window).bind("scroll", 0);
});

var tr = document.querySelectorAll(".edit-btn");
tr.forEach((el) => {
  el.addEventListener("click", (result) => {
    $("#containerEdit").show();
    $(window).bind("scroll", 0);
    var dadosProd = result.target.parentElement.parentElement.children;
    //console.log(dadosProd[1].innerText)

    $('#nomeEdit').val(dadosProd[0].innerText)
    $('#cargoEdit').val(dadosProd[1].innerText)
    $('#emailEdit').val(dadosProd[3].innerText)
    $("#statusEdit").each(function (a, b) {
      for (var i = 0; i < b.children.length; i++) {
        if (dadosProd[1].innerText == b.children[i].text) {
          $("#statusEdit").val(i + 1)
        }
      }
    })
  });
});

/* const dadosUsuarios = event.target.closest("tr").querySelectorAll("td");
const usuariosInfo = {};

dadosUsuarios.forEach(function (element) {
  console.log(element)
  usuariosInfo[element.cellIndex] = element.textContent;
});

console.log("dataaas");
console.log(usuariosInfo);

$(".nome").val(usuariosInfo[1]);
$(".cargo").val(usuariosInfo[2]);
$(".email").val(usuariosInfo[4]); */



