// Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require('./models/Postagem')
const Postagem = mongoose.model("postagens")
require('./models/Categoria')
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport) //Foi passado esse parâmatro pq na linha 10 do auth.js essa variável está sendo declarada como parâmetro.

// Configurações
//Configurar sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))
//Configurar passport
app.use(passport.initialize())
app.use(passport.session())
//Configurar o flash
app.use(flash())

// Middleware
app.use((request, response, next) => {
    response.locals.success_msg = request.flash("success_msg")
    response.locals.error_msg = request.flash("error_msg")
    response.locals.error = request.flash("error")
    response.locals.user = request.user || null;
    next()
})
//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// Handlebars
app.engine('handlebars', handlebars({ defaulLayaout: 'main' }))
app.set('view engine', 'handlebars');
// Mogoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp")
    .then(() => {
        console.log("Conectado ao mongo")
    })
    .catch((err) => {
        console.log("Erro ao tentar se conectar ao mongo: " + err)
    })
// Em Breve
// Public
app.use(express.static(path.join(__dirname, "public")))

app.use((request, response, next) => {
    console.log("Oi, eu sou o Middleware!")
    next()
})
// Rotas
app.get('/', (request, response) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        response.render('index', { postagens: postagens })
    }).catch((err) => {
        request.flash("error_msg", "Houve um erro interno")
        response.redirect("/404")
    })

})

app.get("/postagem/:slug", (request, response) => {
    Postagem.findOne({ slug: request.params.slug }).then((postagem) => {
        if (postagem) {
            response.render("postagem/index", { postagem: postagem })
        } else {
            request.flash("error_msg", "Essa postagem não existe")
            response.redirect("/")
        }
    }).catch((err) => {
        request.flash("error_msg", "houve um erro interno")
        response.redirect("/")
    })
})

app.get("/404", (request, response) => {
    response.send('Erro 404!')
})

app.get("/categorias", (request, response) => {
    Categoria.find().then((categorias) => {
        response.render("categorias/index", { categorias: categorias })
    }).catch((err) => {
        request.flash("error_msg", "Houve um erro interno ao listar as categorias.")
        response.redirect("/")
    })
})

app.get("/categorias/:slug", (request, response) => {
    Categoria.findOne({ slug: request.params.slug }).then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).then((postagens) => {
                response.render("categorias/postagens", { postagens: postagens, categoriria: categoria })
            }).catch((err) => {
                request.flash("error_msg", "Houve um erro ao listar os posts")
                response.redirect("/")
            })
        } else {
            request.flash("error_msg", "Essa categoria não existe")
            response.redirect("/")
        }
    }).catch((err) => {
        request.flash("error-msg", "Houve um erro interno ao tentar carregar a página dessa categoria")
        response.redirect("/")
    })
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)
// Outros
const PORT = process.env.PORT || 8089
app.listen(PORT, () => {
    console.log("Servidor rodando...")
})