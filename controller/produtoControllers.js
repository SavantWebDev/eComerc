const express = require("express");
const router = express.Router();
const knex = require("../Database/connection");
const auth = require("../middleware/auth");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const moment = require('moment')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.get("/product", auth, async (req, res) => {
  await knex.raw("SELECT * FROM estoque ORDER BY id ASC").then((result) => {
    res.json({
      produtos: result.rows,
    });
  });
});

router.get("/", auth, (req, res) => {
  res.render("dashboard", {
    username: req.session.user,
    funcao: req.session.funcao,
  });
});

router.get("/estoque", auth, async (req, res) => {
  var error = req.flash("error");
  var success = req.flash("success");
  var alert = req.flash("alert");
  var qnt = req.flash("qnt");
  var ean = req.flash("ean");
  var qntExist = req.flash("qntExist");

  error = error == undefined || error.length == 0 ? undefined : error;
  success = success == undefined || success.length == 0 ? undefined : success;
  alert = alert == undefined || alert.length == 0 ? undefined : alert;
  qnt = qnt == undefined || qnt.length == 0 ? undefined : qnt;
  ean = ean == undefined || ean.length == 0 ? undefined : ean;
  qntExist =
    qntExist == undefined || qntExist.length == 0 ? undefined : qntExist;

  await knex
    .raw(
      "SELECT * FROM estoque a INNER JOIN tb_categorias b ON a.idcategoria = b.idcategoria ORDER BY a.id ASC"
    )
    .then(async (result) => {
      var totalProdutos = await knex.raw(`
                SELECT SUM(qnt) FROM estoque
            `);

      var categorias = await knex.raw(
        "SELECT idcategoria, nomecategoria FROM tb_categorias"
      );

      var qntCategoria = await knex.raw(
        `
          SELECT COUNT(b.nomecategoria) as value, 
          b.nomecategoria as name
          FROM estoque a 
          inner join tb_categorias b 
          ON a.idcategoria = b.idcategoria 
          GROUP BY b.nomecategoria
        `
      )

      var rankvendidos = await knex.raw(`
        SELECT nomeproduto, 
        SUM(qntvendido) as qntvendido 
        FROM tb_vendas tv
        INNER JOIN estoque e
        ON tv.eanproduto = e.ean
        GROUP BY nomeproduto 
        ORDER BY qntvendido DESC LIMIT 6
      `)

      res.render("index", {
        products: result.rows,
        error: error,
        success: success,
        alert: alert,
        qnt: qnt,
        ean: ean,
        qntExist: qntExist,
        totalProdutos: totalProdutos.rows[0].sum,
        username: req.session.user,
        funcao: req.session.funcao,
        categorias: categorias.rows,
        qntCategoria: qntCategoria.rows,
        rankVendidos: rankvendidos.rows
      });
    })
    .catch((err) => console.log(err));
});

router.post("/add-product", auth, upload.single("foto"), async (req, res) => {
  var { ean, nomeproduto, descricao, qnt, valor, categoria, valorpix, valorprazo } = req.body;
  var foto = req.file;
  var now = moment().format()

  if (foto != undefined) {
    foto = foto.path.replace("public", "");
  } else {
    foto = "/src/image/imagemImagem.png";
  }

  if (
    ean == undefined ||
    ean.length == 0 ||
    nomeproduto == undefined ||
    nomeproduto.length == 0 ||
    qnt == undefined ||
    qnt.length == 0 ||
    valor == undefined ||
    valor.length == 0 ||
    valorpix == undefined ||
    valorpix.length == 0 ||
    valorprazo == undefined ||
    valorprazo.length == 0
  ) {
    var error = "Proibido campos vazios!";
    req.flash("error", error);
    return res.redirect("/estoque");
  }

  valor = valor.includes(",") ? valor : valor + ",00";
  valorpix = valorpix.includes(',') ? valorpix.replace(',', '.') : valorpix
  valorprazo = valorprazo.includes(',') ? valorprazo.replace(',', '.') : valorprazo

  var exist = await knex.raw(`SELECT * FROM estoque WHERE ean = ${ean}`);

  console.log(exist);

  if (exist.rows[0] != undefined) {
    var alert = "Já existe este produto no estoque.";
    req.flash("alert", alert);
    req.flash("qnt", qnt);
    req.flash("ean", ean);
    req.flash("qntExist", exist.rows[0].qnt);
    res.redirect("/estoque");
  } else {
    await knex
      .raw(
        `INSERT INTO estoque VALUES (${ean}, '${valor}', '${nomeproduto.toUpperCase()}', '${descricao}', ${qnt}, '${foto}', '${categoria}', default, ${valorpix}, ${valorprazo}, '${now}') `
      )
      .then(() => {
        console.log("Inserido");
        var success = "Produto adicionado com sucesso!";
        req.flash("success", success);
        res.redirect("/estoque");
      })
      .catch((e) => {
        console.log(e);
        var error = "Erro em inserir produto.";
        req.flash("error", error);
        res.redirect("/estoque");
      });
  }
});
router.get("/pdv", auth, (req, res) => {
  res.render("pdv", {
    username: req.session.user,
    funcao: req.session.funcao,
  });
});
router.get("/add-product/exist", auth, async (req, res) => {
  var { ean, qnt } = req.query;

  if (
    ean == undefined ||
    ean.length == 0 ||
    qnt == undefined ||
    qnt.length == 0
  ) {
    var error = "Necessita informar quantidade e código de barras!";
    req.flash("error", error);
    res.redirect("/estoque");
  } else {
    var qntExist = await knex.raw(`SELECT qnt FROM estoque WHERE ean = ${ean}`);
    var qntFinal = parseInt(qnt) + parseInt(qntExist.rows[0].qnt);
    await knex
      .raw(
        `
            UPDATE estoque SET qnt = ${qntFinal} WHERE ean = ${ean}
        `
      )
      .then(() => {
        var success = "Quantidade adicionada ao produto existente";
        req.flash("success", success);
        res.redirect("/estoque");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/estoque");
      });
  }
});

router.post("/edit-product", auth, upload.single("foto"), async (req, res) => {
  var { ean, nomeproduto, descricao, qnt, valor, id, categoria, valorpix, valorprazo } = req.body;
  var foto = req.file;

  console.log(categoria);

  var prod = await knex.raw(`SELECT * FROM estoque WHERE id = ${id}`);

  if (foto != undefined) {
    foto = foto.path.replace("public", "");
    if (prod.rows[0].image != "/src/image/imagemImagem.png") {
      var x = await fs.unlinkSync(`public/${prod.rows[0].image}`);
      console.log(x);
    }
  } else {
    foto = prod.rows[0].image;
  }

  if (
    id == undefined ||
    id.length == 0 ||
    ean == undefined ||
    ean.length == 0 ||
    nomeproduto == undefined ||
    nomeproduto.length == 0 ||
    qnt == undefined ||
    qnt.length == 0 ||
    valor == undefined ||
    valor.length == 0 ||
    valorpix == undefined ||
    valorpix.length == 0 ||
    valorprazo == undefined ||
    valorprazo.length == 0
  ) {
    var error = "Proibido campos vazios!";
    req.flash("error", error);
    return res.redirect("/estoque");
  }

  valor = valor.includes(",") ? valor : valor + ",00";
  valorpix = valorpix.includes(',') ? valorpix.replace(',', '.') : valorpix
  valorprazo = valorprazo.includes(',') ? valorprazo.replace(',', '.') : valorprazo

  console.log(valor);

  if (prod != undefined) {
    try {
      await knex
        .raw(
          `
            UPDATE estoque SET ean = ${ean}, nomeproduto = '${nomeproduto.toUpperCase()}', descricao = '${descricao}', qnt = ${qnt}, valor = '${valor}', image = '${foto}', idcategoria = ${categoria}, valor_pix = ${valorpix}, valor_prazo = ${valorprazo} WHERE id = ${id}
          `
        )
        .then(function () {
          var success = "Produto editado com sucesso!";
          req.flash("success", success);
          res.redirect("/estoque");
        })
        .catch(() => {
          var error = "Erro em editar produto.";
          req.flash("error", error);
          res.redirect("/estoque");
        });
    } catch (e) {
      var error = "Erro em editar produto.";
      req.flash("error", error);
      res.redirect("/estoque");
    }
  } else {
    var error = "Produto não encontrado!";
    req.flash("error", error);
    res.redirect("/estoque");
  }
});

router.get("/del-product", auth, async (req, res) => {
  var { ean } = req.query;

  console.log(ean);

  if (ean == undefined || ean.length == 0) {
    var error = "Produto não Informado!";
    req.flash("error", error);
    res.redirect("/estoque");
  }

  var exist = await knex.raw(`SELECT * FROM estoque WHERE ean = ${ean}`);
  console.log(exist);
  if (exist.rows[0] != undefined) {
    try {
      if (exist.rows[0].image != "/src/image/imagemImagem.png") {
        var x = await fs.unlinkSync(`public/${exist.rows[0].image}`);
        console.log(x);
      }
      await knex
        .raw(
          `
            DELETE FROM estoque WHERE ean = ${ean}
        `
        )
        .then(() => {
          var success = "O Produto foi deletado!";
          req.flash("success", success);
          res.redirect("/estoque");
        })
        .catch(() => {
          var error = "Erro em deletar produto.";
          req.flash("error", error);
          res.redirect("/estoque");
        });
    } catch (e) {
      var error = "Erro em deletar produto.";
      req.flash("error", error);
      res.redirect("/estoque");
    }
  } else {
    var error = "Produto não encontrado!";
    req.flash("error", error);
    res.redirect("/estoque");
  }
});

/* LÓGICA DE DELETAR VÁRIOS PRODUTOS ESPECÍFICOS DE UMA SÓ VEZ */
router.post('/teste-deletar', async (req, res) => {

  var itens = req.body
  console.log('acessado')
  console.log(itens['itens'].length)

  var query = 'DELETE FROM estoque '

  for (var i = 0; i < itens['itens'].length; i++) {
    if (i == 0) {
      var where = 'WHERE nomeproduto = ' + `'${itens['itens'][i]}'`
    } else {
      var where = ' OR nomeproduto = ' + `'${itens['itens'][i]}'`
    }
    query = query + where
  }

  console.log(query)

  try {
    await knex.raw(query)
      .then(result => {
        console.log(result)
        res.send('deletado com sucesso')
      })
      .catch(e => {
        console.log(e)
        res.send('erro ao deletar')
      })
  }
  catch (e) {
    console.log(e)
  }

})

/* FIM DA LÓGICA DE DELETAR VÁRIOS PRODUTOS ESPECÍFICOS */

module.exports = router;
