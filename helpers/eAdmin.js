module.exports = {
    eAdmin: function (request, response, next) {
        if (request.isAuthenticated() && request.user.eAdmin == 1) {
            return next();
        }
        request.flash("error_msg", "Você precisa ser um Admin")
        response.redirect("/")
    }
}