//global variables

$(function () {

    $(".form-control").on("change", function (e) {
        $("#formCheck").addClass("hidden");
        $(e.target).removeClass("border-danger");
    });

    $("#verifyPassword").on("change", function (e) {
        $("#passwordMatchCheck").addClass("hidden");
        $(e.target).removeClass("border-danger");
    });

    $("#email").on("change", function (e) {
        $("#emailCheck").addClass("hidden");
        $(e.target).removeClass("border-danger");
    });

    $("form").on("submit", function (e) {
        isValid = true;
        if (!isFormValid()) {
            $("#formCheck").removeClass("hidden");
            $("#formCheck").html("All fields are required.");
            isValid = false;
        }
        if (e.target.id === "register" || e.target.id === "reset") {
            if ($("#password").val() != $("#verifyPassword").val()) {
                $("#passwordMatchCheck").removeClass("hidden");
                $("#passwordMatchCheck").html("Passwords do not match.");
                $("#verifyPassword").addClass("border-danger");
                isValid = false;
            }
        }

        if (isValid) {
            submitForm(e.target.id);
        }
        return false;
    });

    function isFormValid() {
        let valid = true;

        $("input").each(function () {
            if ($(this).val().length == 0) {
                $(this).addClass("border-danger");
                valid = false;
            }
        });

        let email = $("#email").val();
        if (email != undefined && email.length > 0) {
            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(email)) {
                $("#emailCheck").removeClass("hidden");
                $("#emailCheck").html("Must be a valid email.");
                $("#email").addClass("border-danger");
                valid = false;
            }
        }
        return valid;
    }

    async function submitForm(route) {
        console.log(route);
        await fetch('/api/user/' + route, {
            method: 'POST',
            credentials: 'include',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": $("#email").val(),
                "password": $("#password").val(),
                "verifyPassword": $("#verifyPassword").val(),
                "firstname": $("#firstname").val(),
                "lastname": $("#lastname").val()
            }),
        })
            .then((response) => {
                if(response.redirected) {
                    $(location).prop('href', response.url);
                } else {
                    return response.json();
                }
            })
            .then((res) => {
                $("#formCheck").removeClass("hidden");

                if(route === "reset") {
                    $("#formCheck").removeClass("text-danger");
                    $("#login_link").removeClass("hidden");
                    $("#submit_btn").addClass("hidden");
                }

                $("#formCheck").html(res.message);
            })
            .catch((error) => {});
    }

}); //ready