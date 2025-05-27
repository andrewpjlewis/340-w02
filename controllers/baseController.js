const utilities = require('../utilities/');
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    req.flash("notice", "This is a flash message.")
    res.render("index", {title: "Home", nav})
}

baseController.throwError = (req, res, next) => {
    const err = new Error('Oh no! There was a crash. Maybe try a');
    err.status = 500;
    next(err);
};

module.exports = baseController