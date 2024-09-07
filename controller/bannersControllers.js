const express = require("express");
const router = express.Router();
const knex = require('../Database/connection')
const auth = require('../middleware/auth')

const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/banners/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

router.get('/banners', auth, async (req, res) => {
    res.render("banners", {
        username: req.session.user,
        funcao: req.session.funcao
    })
})

router.post('/banners', auth, upload.single('foto'), async (req, res) => {
    var { titulo, descricao, botao } = req.body
    var foto = req.file

    if (foto != undefined) {
        foto = foto.path.replace("public", "")
    } else {
        foto = "/src/image/imagemImagem.png"
    }

    await knex.raw(`
        INSERT INTO tb_banners VALUES (DEFAULT, '${titulo}', '${descricao}', '${botao}', '${foto}')
    `)
        .then(result => {
            console.log(result)
            res.redirect('/banners')
        })
        .catch(e => {
            console.log(e)
            res.redirect('/banners')
        })

})

module.exports = router;
