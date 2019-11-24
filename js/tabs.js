function openTab(event, tabName) {
    var contents = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < contents.length; ++i) {
        contents[i].style.display = "none";
    }
    var links = document.getElementsByClassName("tablinks");
    for (var i = 0; i < links.length; i++) {
        links[i].className = links[i].className.replace(" tablinks--active", "");
    }
    document.getElementById(tabName + "Tab").style.display = "block";
    event.currentTarget.className += " tablinks--active";
}

document.getElementById("businessTabLink").click();