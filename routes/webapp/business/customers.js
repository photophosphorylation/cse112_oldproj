exports.get = function(req,res){
    res.render('business/customers', {
			title: 'Customers',
			layout: 'main',
			dashboard: "active"
		});
};
