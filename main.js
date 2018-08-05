
window.onload = function () {
    setTimeout(fadeInTitle, 650);
}

var fadeInTitle = function() {
    var title = document.getElementById("title");
    title.classList.add("fadeInTitle");
    setTimeout(fadeInArrow, 650);
};

var fadeInArrow = function() {
    var arrow = document.getElementById("arrow");
    arrow.classList.add("fadeInArrow");
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
