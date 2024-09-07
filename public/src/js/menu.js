var isActive = false;
$(document).ready(function () {
  $("#btnMenuHeader").click(function (e) {
    e.preventDefault();

    if (isActive) {
      $("header").width("4%");
      $("main").width("96%");
      //$(".logo-dashboard").css("display", "none");
      $("#btnMenuHeader").css("justifyContent", "center");
      $(".menu").css({
        padding: "5px",
      });
      $(".link-menu").each(function () {
        $(".link-menu span").css("display", "none");
        $(".link-menu").css({
          padding: "0",
          width: "100%",
          justifyContent: "center",
          borderRadius: "5px",
        });
      });
      isActive = false;
    } else {
      $("header").width("15%");
      $("main").width("100%");
      $(".logo-dashboard").css("display", "block");
      $("#btnMenuHeader").css("justifyContent", "right");
      $(".menu").css({
        padding: "0 20px",
      });
      $(".link-menu").each(function () {
        $(".link-menu span").css("display", "block");
        $(".link-menu").css({
          padding: "0 5px",
          margin: "5px 0",
          width: "100%",
          justifyContent: "left",
          borderRadius: "5px",
        });
      });
      isActive = true;
    }
  });
});
