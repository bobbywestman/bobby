/**********************************************************/
/*data*/
/**********************************************************/
var projects = [
    {
        id: "musicVisualizer",
        name: "Music Visualizer",
        description: "A music visualization experiment in 3D",
        link: "https://codepen.io/bobbywestman/pen/YjVPZz",
        source: "Codepen",
        tools: [
            {
                name: "Three.js",
                link: "https://threejs.org/"
            }
        ]
    },
    {
        id: "flappyKanye",
        name: "Flappy Kanye",
        description: "A Flappy Bird clone featuring Kanye West",
        link: "https://play.google.com/store/apps/details?id=com.robertwestman.flappykanye",
        source: "Google Play",
        tools: [
            {
                name: "Stencyl",
                link: "http://www.stencyl.com/"
            }
        ]
    },
    {
        id: "aethera",
        name: "Aethera",
        description: "A gravity based game in an ambient environment",
        link: "https://play.google.com/store/apps/details?id=com.robertwestman.aethera",
        source: "Google Play",
        tools: [
            {
                name: "Stencyl",
                link: "http://www.stencyl.com/"
            }
        ]
    }
];

/**********************************************************/
/*init*/
/**********************************************************/
window.onload = function() {
    startFadeInElements();
    setupArrowClickActions();

    setupProjectTiles();
    setupProjectTilesClickActions();
};

var setupArrowClickActions = function() {
    var bow = document.getElementById("bow");
    var projectsArrow = document.getElementById("projectsArrow");
    var contactArrow = document.getElementById("contactArrow");

    var about = document.getElementById("about");
    var projects = document.getElementById("projects");
    var contact = document.getElementById("contact");

    bow.onclick = function() {
        if(about.offsetHeight > window.innerHeight) {
            about.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
            });
        }
        else {
            about.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    };

    projectsArrow.onclick = function() {
        if(projects.offsetHeight > window.innerHeight) {
            projects.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
            });
        }
        else {
            projects.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    };

    contactArrow.onclick = function() {
        contact.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    };
};

/**********************************************************/
/*projects*/
/**********************************************************/
var aProjectIsCurrentlySelected = false;

var setupProjectTiles = function() {
    var projectsGrid = document.getElementById("projectsGrid");

    for(var p in projects) {
        projectsGrid.innerHTML += "<div class=\"projectImgContainer\" id=\""
            + projects[p].id
            + "\"><img src=\"images/"
            + projects[p].id
            + ".png\" class=\"projectImg\"></div>";
    }
};

var setupProjectTilesClickActions = function() {
    //actions on project tiles
    for(var p in projects) {
        var tile = document.getElementById(projects[p].id);

        tile.onclick = (function(p) {
            return function() { projectClicked(projects[p]); }
        })(p);
    }

    //actions on title
    var projectsTitle = document.getElementById("projectsTitle");
    projectsTitle.onclick = function() {
        projectsTitle.style.cursor = "default";

        if(aProjectIsCurrentlySelected) {
            projectClicked();
        }
    };
    projectsTitle.onmouseover = function() {
        if(aProjectIsCurrentlySelected) {
            projectsTitle.style.cursor = "pointer";
        }
        else {
            projectsTitle.style.cursor = "default";
        }
    };
};

var projectClicked = function(project) {
    var grid = document.getElementById("projectsGrid");
    var focus = document.getElementById("focusedProject");
    var focusedProjectGrid = document.getElementById("focusedProjectGrid");
    var name = document.getElementById("focusedProjectName");
    var description = document.getElementById("focusedProjectDescription");
    var tools = document.getElementById("focusedProjectTools");
    var link = document.getElementById("focusedProjectLink");

    if(aProjectIsCurrentlySelected) {
        aProjectIsCurrentlySelected = false;

        focusedProjectGrid.removeChild(document.getElementById("clone"));

        focus.style.display = "none";
        grid.style.display = "block";
    }
    else {
        aProjectIsCurrentlySelected = true;
        
        var copy = document.getElementById(project.id).cloneNode(true);
        copy.setAttribute("id", "clone");
        //reattach click event on clone since .cloneNode() removes them.. //this is messy
        copy.onclick = (function(project) {
            return function() { projectClicked(projects[project]); }
        })(project);
        focusedProjectGrid.insertBefore(copy, document.getElementById("focusedProjectInsert"));
        
        //ADD DIV UNDERNEATH MADE WITH: links , ex "SEE IT ON CODEPEN", "SEE IT ON GOOGLE PLAY", 

        name.innerHTML = project.name;
        description.innerHTML = project.description;
        tools.innerHTML = "Made with: ";
        for (var t in project.tools) {
            tools.innerHTML += "<a target=\"_blank\" rel=\"noopener noreferrer\" href=\""
                + project.tools[t].link
                + "\">" + project.tools[t].name
                + "</a>";

            if(t != project.tools.length - 1) {
                tools.innerHTML += ", ";
            }
        }
        link.innerHTML = "See it on: ";
        link.innerHTML += "<a target=\"_blank\" rel=\"noopener noreferrer\" href=\""
                + project.link
                + "\">" + project.source
                + "</a>";

        grid.style.display = "none";
        focus.style.display = "block";
    }

    scrollToProjects();
};

var scrollToProjects = function() {
    //need this timeout to let focusedProject div finish laying out, so that center is calculated correctly
    setTimeout(scrollToProjectsScroll, 150);
};

var currentScrollPosition;
var scrollToProjectsScroll = function() {
    if(aProjectIsCurrentlySelected) {
        currentScrollPosition = document.documentElement.scrollTop || document.body.scrollTop;

        document.getElementById("projects").scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }
    else {
        // not sure if i like this on/off

        // window.scroll({
        //     top: currentScrollPosition, 
        //     left: 0, 
        //     behavior: "smooth"
        // });
    }
};
    
/**********************************************************/
/*animations*/
/**********************************************************/
var startFadeInElements = function () {
    setTimeout(fadeInTitle, 650);
    setTimeout(fadeInBow, 1500);
};

var fadeInTitle = function() {
    var title = document.getElementById("title");
    title.classList.add("fadeInTitle");
};

var fadeInBow = function() {
    var bow = document.getElementById("bow");
    bow.classList.add("fadeInArrow");
};