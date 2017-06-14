//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".container-fluid ").css("background", "white");
        $(".container-fluid ").css("border-bottom", "1px solid lightgray");
        $(".navbar-default .navbar-nav > li > a").css("color", "#8a959e");
        $("a.joinNow ").css("background", "#ffae00");
        $("a.joinNow ").css("color", "white !important");
        $("a.joinNow ").css("border", "none");

        // $("#navbar-back").css("background", "rgba(34, 53, 71, 1)");
    } else {
        $(".container-fluid ").css("transition", "background 0.5s ease");
        $(".container-fluid ").css("background", "transparent");
        $(".container-fluid ").css("border-bottom", "none");
        $(".navbar-default .navbar-nav > li > a").css("color", "white");
        $("a.joinNow").css("color", "#ffae00 !improtant");
        $("a.joinNow ").css("background", "transparent");
        $("a.joinNow ").css("color", "#ffae00 !important");
        $("a.joinNow ").css("border", "1px solid #ffae00");
    }
});
