$(document).ready(function () {
    $('.add-discount').click(function () {
        $('#product_id').html($(this).data('id'));
        $('#product_name').html($(this).data('name'));
        $('#product_price').html($(this).data('price'));
    });


    $('.remove-discount').click(function () {
 
        
        var product_id = $(this).parent().siblings('.pid').text()
        var price = 0
        const data = {
            productId: product_id,
            productDisprice: price,
            productDiscounted: ""
        }
        $.ajax({
            type: 'POST',   
            data: data,
            url: '/postDiscountItem',
            success:function(result)
            {
                if (result == true)
                {
                    
                }
            }
        })
        data2 = {
            productId: product_id
        }
        var oldPrice = $(this).parent().siblings('.pPrice')
        $.ajax({
            type: 'POST',
            data: data2,
            url: '/getOriginalPrice',
            success:function(result)
            {
                $(oldPrice).html(result.productPrice)
            }
        })

        $(this).addClass('visually-hidden');
        $(this).siblings('.add-discount').removeClass('visually-hidden');
        //Put message in toast box (successful/fail)
        $('#toast-body').html('Discount Removed!')
        showToast();




    });

    $('#submit-discount-btn').click(function () {
        var id =  $('#product_id').text()
        var element = document.getElementById(id);


        var product_id = id
        var oldPrice = parseFloat($('#product_price').text())
        var percent =parseFloat($('#discount-percentage').val())/100.0
        var price = (1.0-percent) * oldPrice
        const data = {
            productId: product_id,
            productDisprice: price,
            productDiscounted: true
        }
        $.ajax({
            type: 'POST',   
            data: data,
            url: '/postDiscountItem',
            success:function(result)
            {
                if (result == true)
                {
                    
                }
            }
        })
        $(element).children(".pButtons").children('.add-discount').addClass('visually-hidden');
        $(element).children(".pButtons").children('.remove-discount').removeClass('visually-hidden');
        $(element).children(".pPrice").html(price)
        //Put message in toast box (successful/fail)
        $('#discount-percentage').val("")
        $('#toast-body').html('Discount Implemented!')
        showToast();




    });

    $("#discount-percentage").on('keypress', function (evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode != 46 && charCode > 31
        && (charCode < 48 || charCode > 57))
            return false;

        return true
      })


});