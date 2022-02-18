$(document).ready(function () {
    $('#rcvr1-btn').click(function (){
        alert('Button 1')

        $.ajax({
            type: 'POST',
            url: '/recovery-post',
            success: function (result) {
                if (result == true) {
                    window.location.replace("/")
    
                } else if(result == false) {
                    window.location.replace("/error-500")
                }
            }
        })
    })
});