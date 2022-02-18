// $(document).ready(function () {

//     $(document).on('click', '.view-movie-btn', function() {
        

//         var data = {
//             id: $(this).data('id'),
//             name: $(this).data('name'),
//             rank: $(this).data('rank'),
//             year: $(this).data('year')
//         }

//         $.ajax({
//             type: 'get',
//             url: '/movie-page:id',
//             data: data,

//             success: function(result) {
//                 if(result != null) {

//                 }
//             }
//         })
//     })
// });

$(document).ready(function () {
    $(document).on('click', '#add-movie-btn', function() {
        const data = {
            movieName: $('#movie-name').val(),
            movieYear: $('#movie-year').val(),
            movieRank: $('#movie-rank').val()
        }

        $.ajax({
            type: 'POST',
            data: data,
            url: '/add-movie',
            success: function (result) {
                if(result == true) {
                    alert("MOVIE ADDED")
                } else {
                    // to error page
                    window.location.replace("/error-500")
                }
            }
        })
    })
})