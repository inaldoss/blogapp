const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
const { eAdmin } = require("../helpers/eAdmin") //Aqui ele está "herdadndo" apenas a função eAdmin do objeto eAdmin.js

router.get('/', eAdmin, (_request, response) => {
    response.render("admin/index")
})

router.get('/posts', eAdmin, (_request, response) => {
    response.send("Página de posts")
})

router.get('/categorias', eAdmin, (_request, response) => {
    Categoria.find().sort({ dste: 'desc' }).then((categorias) => {
        response.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        request.flash("error_msg", "Houve um erro ao listar as categorias")
        response.redirect("/admin")
    })

})

router.get('/categorias/add', eAdmin, (_request, response) => {
    response.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (request, response) => {

    var erros = []

    if (!request.body.nome || typeof request.body.nome == undefined || request.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!request.body.slug || typeof request.body.slug == undefined || request.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }

    if (request.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito pequeno" })
    }

    if (erros.length > 0) {
        response.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: request.body.nome,
            slug: request.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            request.flash("success_msg", "Categoria criada com sucesso!!!")
            response.redirect("/admin/categorias") //Redireciona para a rota de categorias
        }).catch((err) => {
            request.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente mais tarde.")
            response.redirect("/admin")
        })
    }

})

router.get("/categorias/edit/:id", eAdmin, (request, response) => {
    Categoria.findOne({ _id: request.params.id }).then((categoria) => {
        response.render("admin/editcategorias", { categoria: categoria })
    }).catch((err) => {
        request.flash("error_msg", "Esta categoria não existe!")
        response.redirect("/admin/categorias")
    })

})

router.post("/categorias/edit", eAdmin, (request, response) => {
    Categoria.findOne({ _id: request.body.id }).then((categoria) => {

        categoria.nome = request.body.nome
        categoria.slug = request.body.slug

        categoria.save().then(() => {
            request.flash("success_msg", "Categoria editada com sucesso")
            response.redirect("/admin/categorias")
        }).catch((err) => {
            request.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
            response.redirect("/admin/categorias")
        })

    }).catch((err) => {
        request.flash("error_msg", "Houve um erro ao editar a categoria")
        response.redirect("/admin/categorias")
    })
})

router.post("/categorias/delete", eAdmin, (request, response) => {
    Categoria.remove({ _id: request.body.id }).then(() => {
        request.flash("success_msg", "Categoria deletada com sucesso!")
        response.redirect("/admin/categorias")
    }).catch((err) => {
        request.flash("error_msg", "Houve um erro interno ao tentar deletar a categoria!")
        response.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (request, response) => {

    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        response.render("admin/postagens", { modelpost: postagens })
    }).catch((err) => {
        request.flash("error_msg", "Houve um erro ao listar as postagens")
        response.redirect("/admin")
    })

})

router.get("/postagens/add", eAdmin, (request, response) => {
    Categoria.find().then((categorias) => {
        response.render("admin/addpostagem", { categorias: categorias })
    }).catch((err) => {
        request.flash("error_msg", "Houve um erro ao carregar o formulário")
        response.redirect("/admin")
    })

})

router.post("/postagens/nova", eAdmin, (request, response) => {
    var erros = []

    if (request.body.categoria == "0") {
        erros.push({ texto: "Categoria inválida, registre um categoria válida" })
    }

    if (erros.length > 0) {
        response.render("admin/addpostagem", { log: erros })
    } else {
        const novaPostagem = {
            titulo: request.body.titulo,
            descricao: request.body.descricao,
            conteudo: request.body.conteudo,
            categoria: request.body.categoria,
            slug: request.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            request.flash("success_msg", "Postagem criada com sucesso!")
            response.redirect("/admin/postagens")
        }).catch((err) => {
            request.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            response.redirect("/admin/postagens")
        })
    }

})

router.get("/postagens/edit/:id", eAdmin, (request, response) => {

    Postagem.findOne({ _id: request.params.id }).then((postagem) => {

        Categoria.find().then((categorias) => {
            response.render("admin/editpostagens", { listaCategorias: categorias, listaPostagens: postagem })
        }).catch((err) => {
            request.flash("error_msg", "Houve um erro ao listar as categorias")
            response.redirect("/admin/postagens")
        })

    }).catch((err) => {
        request.flash("error_msg", "Houve um erro ao tentar editar a postagem")
        response.redirect("/admin/postagens")
    })

})

router.post("/postagens/edit", eAdmin, (request, response) => {

    Postagem.findOne({ _id: request.body.id }).then((postagem) => {

        postagem.titulo = request.body.titulo
        postagem.slug = request.body.slug
        postagem.descricao = request.body.descricao
        postagem.conteudo = request.body.conteudo
        postagem.categoria = request.body.categoria

        postagem.save().then(() => {
            request.flash("success_msg", "Postagem editada com sucesso!")
            response.redirect("/admin/postagens")
        }).catch((err) => {
            request.flash("error_msg", "Houve um erro ao tentar editar a postagem")
            response.redirect("/admin/postagens")
        })

    }).catch((err) => {
        console.log(err)
        request.flash("error_msg", "Houve um erro ao tentar salvar a edição")
        response.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (request, response) => {
    Postagem.remove({ _id: request.params.id }).then(() => {
        request.flash("success_msg", "Potagem deletada com sucesso")
        response.redirect("/admin/postagens")
    }).catch((err) => {
        request.flash("error_msg", "Houve um erro interno")
    })
})

module.exports = router