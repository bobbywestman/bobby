
window.onload = function () {
    setTimeout(fadeInTitle, 650);
}

var fadeInTitle = function() {
    var title = document.getElementById("title");
    title.classList.add("fadeInTitle");
    setTimeout(fadeInArrow, 850);
};

var fadeInArrow = function() {
    // var arrow = document.getElementById("arrow");
    var bow = document.getElementById("bow");
    // arrow.classList.add("fadeInArrow");
    bow.classList.add("fadeInArrow");
};

window.onscroll = function(){
    // showHideArrow()
};

function showHideArrow()
{
    var scrollBarPosition = window.pageYOffset | document.body.scrollTop;

    if(scrollBarPosition > window.innerHeight * .4) {
        document.getElementById('arrow').style.visibility = "hidden";
    }
    else {
        document.getElementById('arrow').style.visibility = "visible";
    }
};

// var background = document.getElementById('bgImage');
// background.style.top = 'auto';
// background.style.bottom = 0;

// window.onresize = sizeBackground;
// sizeBackground();

// function sizeBackground() {
//   background.style.height = screen.height;
// }