const knex = require('../Database/connection')
const express = require('express')
const router = express.Router()
const validator = require('validator')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const apiURL = '/v1/api'

const fs = require("fs");

const path = require('path')

const multer = require('multer')

const verifyJWT = require('../middleware/jwt')

const auth = require('../middleware/jwt')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/profile");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

router.get(apiURL + '/produtos', async (req, res) => {

    var firstArray = await knex.raw(
        `SELECT ean, valor, valor_pix, nomeproduto, descricao, qnt, idcategoria, created_data,
        CASE
            WHEN image = '/src/image/imagemImagem.png'
            THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
            ELSE replace(image, 'uploads', 'https://iceberg.savantweb.com.br/uploads')
        END as image,
        id FROM estoque LIMIT 8 OFFSET 0`
    )

    var secondArray = await knex.raw(
        `SELECT ean, valor, valor_pix, nomeproduto, descricao, qnt, idcategoria, created_data,
        CASE
            WHEN image = '/src/image/imagemImagem.png'
            THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
            ELSE replace(image, 'uploads', 'https://iceberg.savantweb.com.br/uploads')
        END as image,
        id FROM estoque LIMIT 8 OFFSET 8`
    )

    firstArray.rows.forEach(first => {
        var descricao = first.descricao
        //first.descricao = first.descricao.split('\r\n')
        var regex = /\r\n/g

        first.descricao = descricao.replace(regex, '<br/>')
    })

    res.status(200).json({
        firstProduct: firstArray.rows,
        secondProduct: secondArray.rows
    })
})

//Procurar produto específico pelo código de barras
router.get(apiURL + '/produtos/:ean', async (req, res) => {

    var { ean } = req.params;
    console.log(ean)
    await knex.raw(`
        SELECT ean, nomeproduto, 
            CASE 
	            WHEN e.image = '/src/image/imagemImagem.png'
                THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
                ELSE replace(e.image, 'uploads', 'https://iceberg.savantweb.com.br/uploads')
			END as image, descricao, valor, valor_pix, valor_prazo, nomecategoria
        FROM estoque e
		INNER JOIN tb_categorias tc
		ON e.idcategoria = tc.idcategoria
        WHERE ean = '${ean}'
    `)
        .then(async result => {
            if (result.rows[0] != undefined) {
                var semelhantes = await knex.raw(`
                    SELECT ean, nomeproduto,
                        CASE 
                            WHEN e.image = '/src/image/imagemImagem.png'
                            THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
                            ELSE replace(e.image, '/uploads', 'https://iceberg.savantweb.com.br/uploads')
                        END as image, descricao, valor, valor_pix, valor_prazo, nomecategoria
                    FROM estoque e
                    INNER JOIN tb_categorias tc
                    ON e.idcategoria = tc.idcategoria
                    WHERE nomecategoria = '${result.rows[0]['nomecategoria']}'
                    AND ean != '${result.rows[0]['ean']}'
                    ORDER BY random()
                    LIMIT 4
                `)

                res.status(200).json({ produtoConsultado: result.rows[0], produtosSemelhantes: semelhantes.rows })
            } else {
                res.status(404).json({ error: 'Not Found' })
            }
        })
        .catch(e => {
            console.log(e)
            res.status(400).json({ error: 'error' })
        })

})

router.get(apiURL + '/search', async (req, res) => {
    var { nomeproduto, page } = req.query

    var limit = 16

    var totalpaginas = await knex.raw(
        `
            SELECT COUNT(*) as totalproduto, CEILING(CAST(COUNT(*) as numeric(18, 2)) / CAST(`+ limit +` as numeric(18, 2))) as totalpaginas
            FROM estoque e
            INNER JOIN tb_categorias tc
            ON e.idcategoria = tc.idcategoria
            WHERE e.nomeproduto LIKE '%${nomeproduto.toUpperCase()}%'
            OR tc.nomecategoria LIKE '%${nomeproduto.toUpperCase()}%'
        `
    )

    page < 1 || page == undefined ? page = 1 : page > totalpaginas.rows[0]['totalpaginas'] ? page = totalpaginas.rows[0]['totalpaginas'] : page = page

    var pg = limit * (page - 1)

    await knex.raw(`
            SELECT ean, nomeproduto, CASE 
	            WHEN e.image = '/src/image/imagemImagem.png'
                THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
                ELSE replace(e.image, 'uploads', 'https://iceberg.savantweb.com.br/uploads')
			    END as image,
            CASE
                WHEN descricao = '' THEN 'Sem Descrição'
                ELSE descricao
            END, valor, nomecategoria
                    FROM estoque e
                    INNER JOIN tb_categorias tc
                    ON e.idcategoria = tc.idcategoria
                    WHERE nomeproduto LIKE '%${nomeproduto.toUpperCase()}%'
                    OR nomecategoria LIKE '%${nomeproduto.toUpperCase()}%'
                    LIMIT ${limit} OFFSET ${pg}
    `)
        .then(response => {
            if (response.rows[0] == undefined) {
                console.log(response)
                res.json({ error: "Without Page" })
            } else {
                res.json({ produtos: response.rows, page: parseInt(page), totalpaginas: parseInt(totalpaginas.rows[0].totalpaginas) })
            }
        })
        .catch(e => {
            console.log(e)
            res.status(400).json({ error: "Error" })
        })
})

router.post(apiURL + '/login', async (req, res) => {
    var { email, senha } = req.body

    var conf = await knex('tb_clientes').select().where({ email: email })
    console.log(conf[0])

    if (conf[0] != undefined) {
        var correct = bcrypt.compareSync(senha, conf[0].pass)
        if (correct) {
            const token = jwt.sign(
                {
                    email: conf[0].email,
                    username: conf[0].username,
                    id: conf[0].idcliente
                },
                process.env.SECRET,
                {
                    expiresIn: '86400s'
                }
            )
            res.status(201).json({ msg: "Usuário logado", token })
        } else {
            res.status(400).json({ msg: "Credenciais Incorretas" })
        }
    } else {
        res.status(404).json({ msg: "Credenciais Incorretas" })
    }
})

router.post(apiURL + '/cadastrar', async (req, res) => {
    var { email, senha, celular, nascimento, cpf, notificacao, nome } = req.body

    if (!cpf.includes('-') || !cpf.includes('.')) {
        console.log(cpf)
        var primeiroDigito = cpf.substring(0, 3)
        var segundoDigito = cpf.substring(3, 6)
        var terceiroDigito = cpf.substring(6, 9)
        console.log(primeiroDigito)
        console.log(segundoDigito)
        var cpfCompleto = primeiroDigito + '.' + segundoDigito + '.' + terceiroDigito + '-' + cpf.substring(9, 11)
    } else {
        var cpfCompleto = cpf
    }

    var exist = await knex.raw(`SELECT * FROM tb_clientes WHERE email = '${email}' OR cpf = '${cpf}'`)
    console.log(exist.rows[0])
    var idade = moment().subtract(18, 'years').format('YYYY')
    if (!(nascimento.split('-')[0] <= idade)) {
        return res.status(400).json({ msg: "Idade Inválida!" })
    }
    if (exist.rows[0] == undefined) {
        if (validator.isEmail(email)) {
            if (validator.isMobilePhone(celular)) {

                var id = uuidv4()
                var salt = bcrypt.genSaltSync(10)
                var hash = bcrypt.hashSync(senha, salt)
                await knex.raw(`
                    INSERT INTO tb_clientes VALUES('${id}', '${email}', '${hash}', '${cpfCompleto}', '${celular}', '${nascimento}', '${nome}', '${notificacao}', '/src/image/default.png')
                `)
                    .then(() => {
                        res.status(200).json({ msg: "Sucesso" })
                    })
                    .catch(e => {
                        console.log(e)
                        res.status(400).json({ msg: "Error" })
                    })
            } else {
                res.status(400).json({ msg: "Telefone Inválido!" })
            }
        } else {
            res.status(400).json({ msg: "Email Inválido!" })
        }
    } else {
        res.status(400).json({ msg: "Usuário já Cadastrado!" })
    }

})

router.get(apiURL + '/categorias', async (req, res) => {
    var categorias = await knex.raw(`
        SELECT nomecategoria FROM tb_categorias
    `)

    if (categorias.rows[0] == undefined) {
        return res.status(200).json({ 'categorias': null })
    } else {
        return res.status(200).json({
            'categorias': categorias.rows.map(category => category['nomecategoria'])
        })
    }


})

router.get(apiURL + '/maisvendidos', async(req, res) => {
    await knex.raw(`
    SELECT eanproduto, count(eanproduto) as quantidade, nomeproduto, CASE 
        WHEN e.image = '/src/image/imagemImagem.png'
        THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
        ELSE replace(e.image, 'uploads', 'https://iceberg.savantweb.com.br/uploads')
        END as image, e.valor, valor_pix, valor_prazo, created_data FROM tb_vendas tv
    INNER JOIN estoque e
    ON e.ean = tv.eanproduto
    GROUP BY eanproduto, nomeproduto, image, e.valor, valor_pix, valor_prazo, created_data
    ORDER BY quantidade DESC
    `)
    .then(resp => {
        res.json(
            {
                'mais_vendidos': resp.rows.map(i => (
                    {
                        'ean': i.eanproduto,
                        'nomeproduto': i.nomeproduto,
                        'image': i.image,
                        'valor': i.valor,
                        'valor_pix': i.valor_pix,
                        'valor_prazo': i.valor_prazo,
                        'created_data': i.created_data
                    }
                ))
            }
        )
    })
    .catch(e => {
        res.json({msg: 'Error', error: e})
    })
})

router.post(apiURL + '/sell-product', async (req, res) => {
    var { product, valorTotal, cpf, form_pagamento } = req.body

    console.log(product, valorTotal, cpf)
    var valorTotal = 0
    var def = '';
    var transicao = moment().format()

    if (cpf != undefined) {
        var idcliente = await knex.raw(`
            SELECT idcliente FROM tb_clientes WHERE cpf = '${cpf}'
        `)

        if (idcliente.rows[0] == undefined || idcliente.rows[0] == '' || idcliente.rows[0].length == 0) {
            def = "0b982466-96b2-40c9-bb83-7f0243ace5e1"
        } else {
            def = idcliente.rows[0]['idcliente']
        }
    } else {
        def = "0b982466-96b2-40c9-bb83-7f0243ace5e1"
    }

    var stringAleatoria = ''
    var caracteres = '0123456789';
    for (var i = 0; i < 20; i++) {
        stringAleatoria += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }


    for (var i = 0; product.length > i; i++) {
        var valorTotalProduto = 0;
        valorTotalProduto += parseFloat((product[i].precounitario).replace(',', '.')) * product[i].qnt
        valorTotal += valorTotalProduto

        valorTotalProduto = valorTotalProduto.toString().replace('.', ',')

        console.log('Produto Passado: ' + product[i].ean)
        console.log('CPF: ' + cpf)
        console.log('Quantidade: ' + product[i].qnt)
        console.log('Valor: ' + product[i].valor)
        console.log('Valor Total Produto: ' + valorTotalProduto)
        console.log(stringAleatoria)
        console.log(def)
        console.log('-------------------------------------')
        console.log(form_pagamento)
        console.log(moment().format())

        var verifyEstoque = await knex.raw(
            `SELECT * FROM estoque WHERE ean = '${product[i].ean}' AND qnt >= ${product[i].qnt}`
        )

        if (verifyEstoque.rows[0] != undefined) {
            var quantidade = verifyEstoque.rows[0].qnt - product[i].qnt
            console.log(quantidade)
            await knex.raw(`
                UPDATE estoque SET qnt = ${quantidade} WHERE ean = '${product[i].ean}'
            `)
            await knex.raw(
                `INSERT INTO tb_vendas 
                VALUES (${product[i].ean}, ${product[i].qnt}, '${product[i].valor}', '${transicao}', '${def}', '#${stringAleatoria}', ${form_pagamento})`
            ).then(() => {
                console.log('Produto vendido com sucesso.')
            }).catch(e => console.log(e))
        } else {
            return res.json({ ean: product[i].ean, msg: "Produto não cadastrado ou sem quantidade o suficiente para venda." })
        }

        /* if (i == product.length - 1) {
            console.log('Valor Total: ' + valorTotal)
        } */
    }

    res.status(200).json({ itensEnviados: [{ "product": product, "valorTotal": valorTotal, "cpf": cpf }] })
})

router.get(apiURL + '/usuario', auth, async (req, res) => {

    var verifyName = await knex.raw(`SELECT * FROM tb_clientes WHERE idcliente = '${req.session.uuid}'`)

    req.session.user = verifyName.rows[0].username

    var carrinho = await knex.raw(`
        SELECT eanproduto, tcr.qnt, nomeproduto, valor, valor_pix,
        CASE 
                WHEN e.image = '/src/image/imagemImagem.png'
                THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
                ELSE replace(e.image, 'uploads', 'https://iceberg.savantweb.com.br/uploads')
                END as image, nomecategoria FROM tb_carrinho tcr
                INNER JOIN estoque e
                ON tcr.eanproduto = e.ean
                INNER JOIN tb_categorias tcg
                ON tcg.idcategoria = e.idcategoria
                WHERE tcr.uuiduser =  '${req.session.uuid}' 
    `)

    console.log(carrinho.rows)

    res.status(200).json({ email: req.session.email, username: req.session.user, id: req.session.uuid, carrinho: carrinho.rows })
})

router.get(apiURL + '/perfil', verifyJWT, async (req, res) => {
    //var query = `SELECT * FROM tb_clientes WHERE email = '${req.session.email}' AND username = '${req.session.user}'`
    var query = `SELECT * FROM tb_clientes WHERE idcliente = '${req.session.uuid}'`
    await knex.raw(`
        ${query}
    `)
        .then(async resultQuery => {
            console.log(resultQuery.rows[0]['idcliente'])

            var pedidos = await knex.raw(`
                SELECT numeropedido, datavenda, tfp.nome_pagamento, SUM(CAST(replace(tv.valor, ',', '.') as numeric)) as valortotal, jsonb_agg(
                    jsonb_build_object('ean', eanproduto, 'nomeproduto', nomeproduto, 'valorTotalProd', tv.valor, 'qnt', tv.qntvendido, 'valUnit', e.valor)) itens
                FROM tb_vendas tv INNER JOIN tb_clientes tc
                ON tv.uuiduser = tc.idcliente
                INNER JOIN estoque e
                ON e.ean = tv.eanproduto
                INNER JOIN tb_forma_pagamentos tfp
                ON tfp.id = tv.form_pagamento
                WHERE tv.uuiduser = '${req.session.uuid}'
                GROUP BY numeropedido, datavenda, tfp.nome_pagamento
                ORDER BY datavenda DESC
                LIMIT 5
            `)


            res.json({
                usuario:
                {
                    email: resultQuery.rows[0].email,
                    cpf: resultQuery.rows[0].cpf,
                    celular: resultQuery.rows[0].celular,
                    nascimento: resultQuery.rows[0].nascimento,
                    username: resultQuery.rows[0].username,
                    imageProfile: 'https://iceberg.savantweb.com.br' + resultQuery.rows[0].image
                },
                endereco: {},
                ultimosPedidos: pedidos.rows,
                totalPedidos: pedidos.rows.length
            })
        })
        .catch(e => {
            console.log(e)
            res.status(400).json(e)
        })
})

router.put(apiURL + '/card', auth, async (req, res) => {
    var { product } = req.body

    console.log(product)
    console.log(req.session.uuid)

    product.map(async produto => {
        var prod = await knex.raw(`
            SELECT eanproduto, qnt FROM tb_carrinho WHERE eanproduto = '${produto['ean']}' AND uuiduser = '${req.session.uuid}'
        `)

        console.log('-----------------')
        console.log(prod.rows[0])

        if (prod.rows[0] == undefined) {
            await knex.raw(`
                INSERT INTO tb_carrinho VALUES ('${produto['ean']}', ${produto['qnt']}, '${req.session.uuid}')
            `)
                .then(() => {
                    console.log("inserido")
                    res.status(201).json({ msg: "Success" })
                })
                .catch(e => {
                    console.log(e)
                    res.status(401).json({ msg: "Error" })
                })
        } else {
            if (produto.qnt.toString().includes('-')) {
                console.log(produto.qnt)
                var somaqnt = prod.rows[0].qnt - parseInt(produto.qnt.toString().replace('-', ''))
            } else {
                var somaqnt = prod.rows[0].qnt + produto.qnt
            }


            await knex.raw(`
                UPDATE tb_carrinho SET qnt = ${somaqnt} WHERE uuiduser = '${req.session.uuid}' AND eanproduto = '${produto['ean']}'
            `)
                .then(() => {
                    res.json({ msg: "Success" })
                })
                .catch(e => {
                    res.json({ msg: "Error", result: e })
                })
        }
    })

})

router.delete(apiURL + '/card/delprod/:ean', auth, async (req, res) => {
    var { ean } = req.params

    try {
        var sql = `SELECT * FROM tb_carrinho WHERE eanproduto = '${ean}' AND uuiduser = '${req.session.uuid}'`

        var exist = await knex.raw(sql)

        if (exist.rows[0] != undefined) {
            await knex.raw(`
                DELETE FROM tb_carrinho WHERE eanproduto = '${ean}' AND uuiduser = '${req.session.uuid}'
            `)
                .then(result => {
                    console.log(result)
                    res.json({ msg: 'Success' })
                })
                .catch(e => {
                    console.log(e)
                    console.log('error')
                    res.json({ msg: 'Error' })
                })
        } else {
            res.status(400).json({ msg: "Product Not Found" })
        }
    } catch (e) {
        console.log("Deu erro")
        console.log(e)
        res.json({ msg: 'Error' })
    }
})

router.get(apiURL + '/banners', async (req, res) => {

    await knex.raw(`
        SELECT titulo, descricao, botao,
            CASE
                WHEN imagem = '/src/image/imagemImagem.png'
                    THEN 'https://iceberg.savantweb.com.br/src/image/imagemImagem.png'
                    ELSE replace(imagem, '/uploads', 'https://iceberg.savantweb.com.br/uploads')
                END as image
        FROM tb_banners
    `)
        .then(result => {
            console.log(result)
            res.json({ result: result.rows })
        })
        .catch(e => {
            res.status(400).json({ error: "Ocorreu um Erro", nomeErro: e })
        })

})

router.post(apiURL + '/edit', auth, upload.single('foto'), async (req, res) => {
    var { username, telefone } = req.body
    var foto = req.file
    var uuid = req.session.uuid

    if(
        username == 'undefined' || username.length == 0 || username == null || username == undefined || username == '' ||
        telefone == 'undefined' || telefone.length == 0 || telefone == null || telefone == undefined || telefone == '' 
    ){
        return res.status(401).json({msg: "Informações inválidas!"})
    }

    console.log('-----------------')
    console.log(foto)
    console.log(telefone)
    console.log(username)
    console.log(uuid)
    console.log('----------------')

    if (foto == undefined) {
        var sql = `UPDATE tb_clientes SET username = '${username}', celular = '${telefone}'`
      } else {
        foto = foto.path.replace("public", "");
        var sql = `UPDATE tb_clientes SET username = '${username}', celular = '${telefone}', image = '${foto}'`
      }

    var exist = await knex.raw(`SELECT * FROM tb_clientes WHERE idcliente = '${uuid}'`)

    if(exist.rows[0] != undefined){
        if(exist.rows[0]['image'] != '/src/image/default.png'){
            try{
                var x = await fs.unlinkSync(`public${exist.rows[0].image}`);
                console.log(x);
            }
            catch{
                res.status(400).json({erroName: "100325 - API Error",msg: 'Erro em tentar apagar a imagem no servidor.'})
            }
        }
        
        await knex.raw(`
            ${sql} WHERE idcliente = '${uuid}'
        `).then(() => {
            res.status(201).json({msg: "Success"})
        })
        .catch( e => {
            res.status(400).json({msg: e})
        })
    }else{
        res.status(401).json({msg: "Not Found!"})
    }

})

router.post(apiURL + '/edit/pass', auth, async(req, res) => {

    var { senhaAtual, senhaNova } = req.body
    var uuid = req.session.uuid

    var exist = await knex.raw(`
        SELECT * FROM tb_clientes WHERE idcliente = ${uuid}
    `)

    if(exist.rows[0] != undefined){

        var correct = bcrypt.compareSync(senhaAtual, exist.rows[0].pass)

        if(correct){
            var salt = bcrypt.genSaltSync(10)
            var hash = bcrypt.hashSync(senhaNova, salt)
            await knex.raw(`
                UPDATE tb_clientes SET pass = '${hash}' WHERE idcliente = '${uuid}'
            `).then(() => {
                res.json({msg: "Success"})
            })
            .catch(e => {
                res.json({msg: "Error", error: e})
            })
        }else{
            return res.json({msg: 'Invalid!'})
        }

    }else{
        res.status(404).json({msg: 'Not Found!'})
    }

})

module.exports = router