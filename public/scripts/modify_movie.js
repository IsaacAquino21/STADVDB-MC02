$(document).ready(function () {
    $('#update-movie-btn').click(function () {
        var id = $(this).data('id');
        var movie = document.getElementById(id);
        var rank = $(movie).children().children('.movie-rank').text();
        $('#movie-rank').val(rank);
    });

    $('#update-movie-btn-in').click(function () {
        const data = {
            id: $('#movie-id').text(),
            name: $('#movie-name').text(),
            year: $('#movie-year').text(),
            rank: $('#movie-rank').val()
        }

        $.ajax({
            type: 'POST',
            data: data,
            url: '/update-movie',
            success: function (result) {
                if (result == true) {
                    alert("UPDATED MOVIE")

                    var movie = document.getElementById(data.id);

                    $(movie).children().children('.movie-rank').html(data.rank);


                } else if (result == false) {
                    window.location.replace("/error-500");
                }
            }
        })
    });

    $('#delete-movie-btn').click(function () {
        var id = $(this).data('id');
        var movie = document.getElementById(id);

        const data = {
            id: $(this).data('id'),
            name: $(movie).children().children('.movie-name').text(),
            year: $(movie).children().children('.movie-year').text(),
            rank: $(movie).children().children('.movie-rank').text()
        }

        $.ajax({
            type: 'POST',
            data: data,
            url: '/delete-movie',
            success: function (result) {
                if (result == true) {
                    alert("DELETED MOVIE")

                    window.location.replace("/")

                } else if(result == false) {
                    window.location.replace("/error-500")
                }
            }
        })
    });
});