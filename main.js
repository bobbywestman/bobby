/**********************************************************/
/*data*/
/**********************************************************/
var projects = [
    {
        id: "musicVisualizer",
        name: "3D Music Visualizer",
        description: "A music visualization experiment in 3D",
        link: "https://codepen.io/bobbywestman/pen/YjVPZz?editors=1111",
        tools: [
            {
                tool:"Three.js",
                link:"https://threejs.org/"
            }
        ]
    },
    {
        id: "flappyKanye",
        name: "Flappy Kanye",
        description: "A Flappy Bird clone featuring Kanye West",
        link: "https://play.google.com/store/apps/details?id=com.robertwestman.flappykanye",
        tools: [
            {
                tool:"Stencyl",
                link:"http://www.stencyl.com/"
            }
        ]
    },
    {
        id: "aethera",
        name: "Aethera",
        description: "A gravity based game in an ambient environment",
        link: "https://play.google.com/store/apps/details?id=com.robertwestman.aethera",
        tools: [
            {
                tool:"Stencyl",
                link:"http://www.stencyl.com/"
            }
        ]
    }
];

/**********************************************************/
/*init*/
/**********************************************************/
window.onload = function() {
    setTimeout(fadeInTitle, 650);

    setupProjectTiles();
};

/**********************************************************/
/*projects*/
/**********************************************************/
var setupProjectTiles = function() {
    for(var p in projects) {
        var tile = document.getElementById(projects[p].id);

        tile.onclick = (function(p) {
            return function() { projectClicked(projects[p]); }
        })(p);
    }
};

var aProjectIsCurrentlySelected = false;

var projectClicked = function(project) {
    var grid = document.getElementById("projectsGrid");
    var focus = document.getElementById("focusedProject");

    if(aProjectIsCurrentlySelected) {
        aProjectIsCurrentlySelected = false;

        focus.removeChild(focus.firstChild);

        focus.style.display = "none";
        grid.style.display = "block";
    }
    else {
        aProjectIsCurrentlySelected = true;
        
        var copy = document.getElementById(project.id).cloneNode(true);
        copy.style.removeProperty("float");
        copy.style.float = "";

        //reattach click event on clone.. this is messy
        copy.onclick = (function(project) {
            return function() { projectClicked(projects[project]); }
        })(project);
        focus.insertBefore(copy, focus.firstChild);
        
        grid.style.display = "none";
        focus.style.display = "flex";
    }
};

/**********************************************************/
/*animations*/
/**********************************************************/
var fadeInTitle = function() {
    var title = document.getElementById("title");
    title.classList.add("fadeInTitle");
    setTimeout(fadeInArrow, 850);
};

var fadeInArrow = function() {
    var bow = document.getElementById("bow");
    bow.classList.add("fadeInArrow");
};