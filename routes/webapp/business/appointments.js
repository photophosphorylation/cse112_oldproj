exports.get = function(req,res){
  res.render('business/appointments', {
    title: 'Appointments',
    message: req.flash("permission"),
    layout: 'main',
  });
};
