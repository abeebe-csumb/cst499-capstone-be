$("a.list-group-item").on("click", function(e) {
    $(this).addClass("active")
    .siblings().removeClass("active");
});

$("#newEntryBtn").on("click", function(e) {
    $("#newEntryForm").removeClass("hidden");
});

$("#cancel_btn").on("click", function(e) {
    $("#newEntryForm").addClass("hidden");
});