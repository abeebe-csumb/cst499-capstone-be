$("#newEntryBtn").on("click", function(e) {
    $("#newEntryForm").removeClass("hidden");
    $("#journalContent").addClass("hidden");
});

$("#cancel_btn").on("click", function(e) {
    $("#newEntryForm").addClass("hidden");
    $("#journalContent").removeClass("hidden");
});