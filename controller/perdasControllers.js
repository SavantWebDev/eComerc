const express = require('express')
const router = express.Router()
const auth = require("../middleware/auth");

router.get('/perdas', auth, async (req, res) => {
    res.render('perdas', {
        username: req.session.user,
        funcao: req.session.funcao
    })
})

module.exports = router