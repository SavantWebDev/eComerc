$(document).ready(function () {
  $(".usermenu").click(function (e) {
    e.preventDefault();
    if ($(".show-user-details").css("opacity") !== "0") {
      $("#arrowUpDash").css({
        transform: "rotate(0deg)",
        transition: "all 0.3s",
      });
      $(".show-user-details").addClass("close-user-details");
      $(".show-user-details").removeClass("open-user-details");
      setTimeout(() => {
        $(".show-user-details").removeClass("close-user-details");
      }, 100);
    } else {
      $("#arrowUpDash").css({
        transform: "rotate(180deg)",
        transition: "all 0.3s",
      });

      $(".show-user-details").addClass("open-user-details");
      $(".show-user-details").removeClass("close-user-details");
    }
  });
});
