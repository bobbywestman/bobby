/**********************************************************/
/*data*/
/**********************************************************/
var projects = [
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
        id: "mapDraw",
        name: "MapDraw",
        description: "An iOS app to draw on maps",
        link: "https://apps.apple.com/us/app/mapdraw-app/id1471554859",
        source: "iOS App Store",
        tools: [
            {
                name: "Swift",
                link: "https://swift.org/"
            },
            {
                name: "Xcode",
                link: "https://developer.apple.com/xcode/"
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

window.onresize = function() {
    // console.log("width: " + window.innerWidth);
};

var setupArrowClickActions = function() {
    var bow = document.getElementById("bow");
    var projectsArrow = document.getElementById("projectsArrow");
    var contactArrow = document.getElementById("contactArrow");

    bow.onclick = function() {
        scrollToAbout();
    };

    projectsArrow.onclick = function() {
        scrollToProjects();
    };

    contactArrow.onclick = function() {
        scrollToContacts();
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
        //summary of below:
        // - clone the tile that was clicked
        // - add all details

        aProjectIsCurrentlySelected = true;
        
        var copy = document.getElementById(project.id).cloneNode(true);
        copy.setAttribute("id", "clone");
        //reattach click event on clone since .cloneNode() removes them.. //this is messy
        copy.onclick = (function(project) {
            return function() { projectClicked(projects[project]); }
        })(project);
        focusedProjectGrid.insertBefore(copy, document.getElementById("focusedProjectInsert"));
        
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

    //need this timeout to let focusedProject div finish laying out, so that center is calculated correctly
    setTimeout(scrollToProjects, 150);
};

/**********************************************************/
/*scrolling*/
/**********************************************************/
var scrollToProjects = function() {
    var projects = document.getElementById("projects");

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

var scrollToContacts = function() {
    var contact = document.getElementById("contact");

    contact.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
    });
}

var scrollToAbout = function() {
    var about = document.getElementById("about");

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
}

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