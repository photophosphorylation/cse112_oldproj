
exports.get = function(req, res) {
	req.logout();
    res.render('business/login', { 
    	message: req.flash("login"),
    	layout: false
    });
};


