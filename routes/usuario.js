const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/registro", (request, response) => {
    response.render("usuarios/registro")
})

router.post("/registro", (request, response) => {
    var erros = []

    if (!request.body.nome || typeof request.body.nome == undefined || request.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!request.body.email || typeof request.body.email == undefined || request.body.email == null) {
        erros.push({ texto: "E-mail inválido" })
    }

    if (!request.body.senha || typeof request.body.senha == undefined || request.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }

    if (request.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" })
    }

    if (request.body.senha != request.body.senha2) {
        erros.push({ texto: "As senhas são diferentes, tente novamente!" })
    }

    if (erros.length > 0) {
        response.render("usuarios/registro", { erros: erros })
    } else {
        Usuario.findOne({ email: request.body.email }).then((usuario) => {
            if (usuario) {
                request.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema.")
                response.redirect("/usuarios/registro")
            } else {
                const novoUsuario = new Usuario({
                    nome: request.body.nome,
                    email: request.body.email,
                    senha: request.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            request.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            response.redirect("/")
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            request.flash("success_msg", "Usuário criado com sucesso!")
                            response.redirect("/")
                        }).catch((err) => {
                            request.flash("error_msg", "houve um erro ao criar usuário")
                            response.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            request.flash("error_msg", "Houve um erro interno")
            response.redirect("/")
        })
    }
})

router.get("/login", (request, response) => {
    response.render("usuarios/login")
})

router.post("/login", (request, response, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(request, response, next)
})

router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")
})

module.exports = router