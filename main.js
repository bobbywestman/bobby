window.onload = function () {
    setTimeout(fadeInTitle, 650);
}

var fadeInTitle = function() {
    var title = document.getElementById("title");
    title.classList.add("fadeInTitle");
    setTimeout(fadeInCarrot, 650);
};

var fadeInCarrot = function() {
    var carrot = document.getElementById("carrot");
    carrot.classList.add("fadeInCarrot");
};
