if (process.env.NODE_ENV == "production") {
    module.exports = { MONGOURI: "mongodb+srv://inaldoss:scastro126@blogapp-prod-s7dn6.mongodb.net/authSource=admin" }
} else {
    //module.exports = { MONGOURI: "mongodb+srv://inaldoss:scastro126@blogapp-prod-s7dn6.mongodb.net/authSource=admin" }
    module.exports = { MONGOURI: "mongodb://localhost/blogapp" }
}