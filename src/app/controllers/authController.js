const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const authConfig = require("../../config/auth.json")


const router = express.Router();

function generteToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: "Usuário já cadastrado" })
        }
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ user, token: generteToken({ id: user.id }) });
    } catch (error) {
        res.status(400).send({ error: 'Falha na inclusão' })
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).send({ error: 'Senha e email inválidos' });
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: 'Senha e email inválidos' });
        }

        user.password = undefined;

        return res.send({ user, token: generteToken({ id: user.id }) });
    } catch (error) {
        res.status(400).send({ error: 'Falha na autenticação' })
    }
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: "Usuário não encontrado" });
        }

        const token = crypto.randomBytes(20).toString(hex);

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetExpires: now,
                passwordResetToken: token
            }
        });

        console.log(token, now);
    } catch (error) {
        return res.status(400).send({ error: "Erro geral" });
    }
})

module.exports = app => app.use('/auth', router);