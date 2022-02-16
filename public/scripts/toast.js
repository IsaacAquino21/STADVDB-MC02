var option = {
    animation: true,
    delay: 1000
};
//Create Toast element
var toast = document.getElementById("toast");
var toastElement = new bootstrap.Toast(toast, option);

//function used to make welcome toast visible
function showToast(){
    var elem = document.getElementById('toast-container');
    elem.style.visibility = 'visible';
    toastElement.show();
}

function hideToast(){
    var elem = document.getElementById('toast-container');
    elem.style.visibility = 'hidden';
    toastElement.hide();
}

toast.addEventListener('hidden.bs.toast', function () {
    var elem = document.getElementById('toast-container');
    elem.style.visibility = 'hidden';
  })
