/**
 * Created with JetBrains WebStorm.
 * User: hariharasudhan
 * Date: 21/11/13
 * Time: 7:13 AM
 * To change this template use File | Settings | File Templates.
 */
$(function () {
    $('#randomize').click(function (event) {

    });

    $('#invest_few').click(function (event) {
        var amount = $("#invest_input").val();
        if (amount.length == 0) return;
        var val = parseFloat(amount);
        if (!isNaN(val)) {
            socket.emit("invest", {amount: amount, gid: getCookie("gambit_guid")});
            $("#invest_input").val("");
        }
    });

    function set_investment(val) {
        $('.investment').html(parseFloat(val).toFixed(7));
    }

    socket.on("update", function (message) {
        $.each(message, function (key, value) {
            switch (key) {
                case "balance":
                    set_bal(value);
                    break;
                case "investment":
                    set_investment(value);
                    break;

            }
        });
    });
});