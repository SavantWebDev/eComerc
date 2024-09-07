const knex = require('../Database/connection')

async function auth(req, res, next) {
    if (req.session.user != undefined) {
        var result = await knex.raw(
            `
                SELECT * FROM users u 
                LEFT JOIN tb_funcao tf 
                ON u.funcao = tf.idfuncao 
                WHERE email = '${req.session.email}' 
                AND username = '${req.session.user}'
            `
        )
        if (result.rows[0] != undefined) {
            req.session.funcao = result.rows[0]['nomefuncao']
            next()
        } else {
            req.session.user = undefined;
            res.redirect('/login');
        }

    } else {
        res.redirect('/login')
    }

}

module.exports = auth