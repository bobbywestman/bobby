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
                name:"Three.js",
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
                name:"Stencyl",
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
                name:"Stencyl",
                link:"http://www.stencyl.com/"
            }
        ]
    }
];

/**********************************************************/
/*init*/
/**********************************************************/
window.onload = function() {
    startFadeInElements();

    setupProjectTilesClickActions();
};

/**********************************************************/
/*projects*/
/**********************************************************/
var setupProjectTilesClickActions = function() {
    //add click action on each tile
    for(var p in projects) {
        var tile = document.getElementById(projects[p].id);

        tile.onclick = (function(p) {
            return function() { projectClicked(projects[p]); }
        })(p);
    }
};

var aProjectIsCurrentlySelected = false;

var projectClicked = function(project) {
    scrollToProjects();

    var grid = document.getElementById("projectsGrid");
    var focus = document.getElementById("focusedProject");
    var focusedProjectGrid = document.getElementById("focusedProjectGrid");

    if(aProjectIsCurrentlySelected) {
        aProjectIsCurrentlySelected = false;

        //remove clone
        focusedProjectGrid.removeChild(document.getElementById("clone"));

        focus.style.display = "none";
        grid.style.display = "block";
    }
    else {
        aProjectIsCurrentlySelected = true;
        
        //clone the selected project tile
        var copy = document.getElementById(project.id).cloneNode(true);
        copy.setAttribute("id", "clone");

        //reattach click event on clone since .cloneNode() removes them..
        //this is messy
        copy.onclick = (function(project) {
            return function() { projectClicked(projects[project]); }
        })(project);

        //add clone
        focusedProjectGrid.insertBefore(copy, document.getElementById("focusedProjectInsert"));
        
        grid.style.display = "none";
        focus.style.display = "block";
    }
};

var scrollToProjects = function() {
    setTimeout(scrollToProjectsScroll, 100);
};

var scrollToProjectsScroll = function() {
    document.getElementById('projects').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
    });
};
    
/**********************************************************/
/*animations*/
/**********************************************************/
var startFadeInElements = function () {
    setTimeout(fadeInTitle, 650);
    setTimeout(fadeInArrow, 1500);
};

var fadeInTitle = function() {
    var title = document.getElementById("title");
    title.classList.add("fadeInTitle");
};

var fadeInArrow = function() {
    var bow = document.getElementById("bow");
    bow.classList.add("fadeInArrow");
};