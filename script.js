
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const docsLinks = document.getElementById("docs_Links");

hamburger.onclick = () => {
	hamburger.classList.toggle("toggle");
	/*
	if(menu.style.transform == "translate(0)"){
		// menu.style.transform = // change back to normal
	} else {
		menu.style.transform = "translate(0px)";
	}
	*/
	menu.classList.toggle("nav-active");
	
	if(!docsLinks) {
		return;
	}

	if(docsLinks.style.transform == "translate(0px)"){
		docsLinks.style.transform = "translate(-280px)";
	} else {
		docsLinks.style.transform = "translate(0px)";
	}
};


