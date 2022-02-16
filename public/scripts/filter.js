$(document).ready(function () {
    $('#check-year').click(function () {
        if($('#check-year').is(":checked")){
            $('#movie-year-field').removeClass('visually-hidden')
        }

        else{
            $('#movie-year-field').addClass('visually-hidden')
        }
    });

    $('#check-rank').click(function () {
        if($('#check-rank').is(":checked")){
            $('#movie-rank-field').removeClass('visually-hidden')
        }

        else{
            $('#movie-rank-field').addClass('visually-hidden')
        }
    });

});