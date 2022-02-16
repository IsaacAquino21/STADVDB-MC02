$(document).ready(function () {
    $('#update-movie-btn').click(function () {
        var id = $(this).data('id');
        var movie = document.getElementById(id);
        var name = $(movie).children().children('.movie-name').text();
        var year = $(movie).children().children('.movie-year').text();
        var rank = $(movie).children().children('.movie-rank').text();
        $('#movie-name').val(name);
        $('#movie-year').val(year);
        $('#movie-rank').val(rank);



    });

});