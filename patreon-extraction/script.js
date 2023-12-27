var initialised = false;
var cmdArgs;
var idToVid;
var pausedIds;
var numIds;

browser.runtime.onMessage.addListener(runExtension);

function runExtension(req, sender, res) {
    cmdArgs = "";
    idToVid = {};
    pausedIds = {};

    if (!initialised) {
	initMessageListener();
	initialised = true;
    }

    let containers = document.querySelectorAll("[data-tag='media-container']");
    for (var i=0; i<containers.length; i++) containers[i].click();
    numIds = containers.length;
}

function initMessageListener() {
    addEventListener("message", (e) => {
	const edata = JSON.parse(e.data);
	if (edata["event"] === "initialDelivery") {
	    idToVid[edata["id"]] = edata["info"]["videoData"]["video_id"];
	    pausedIds[edata["id"]] = false;
	} else if (edata["event"] === "infoDelivery" && !pausedIds[edata["id"]]) {
	    let playingVideo = idToVid[edata["id"]];
	    let frame = document.querySelector("iframe[src*='" + playingVideo + "']");
	    pausedIds[edata["id"]] = true;
	    frame.contentWindow.postMessage('{"event":"command", "func":"pauseVideo", "args":""}', '*');

	    let post = frame.parentElement.parentElement;
	    let postTitle = post.querySelector("[data-tag='post-title']").innerText.trim().replaceAll(/['.,!?]/g,"").replaceAll("/"," ");

	    let postDate = post.querySelector("[data-tag='post-published-at']").innerText;
	    let formattedDate;
	    if (postDate.includes("ago")) {
		formattedDate = new Date();
		if (postDate.includes("days")) {
		    formattedDate.setDate(formattedDate.getDate() - postDate.split(' ')[0]);
		}
	    } else {
		if (postDate.split(',').length < 2) postDate += ", " + new Date().getFullYear();   
		formattedDate = new Date(Date.parse(postDate));
	    }
	    let filename = formattedDate.toISOString().split('T')[0] + "_" + postTitle.replaceAll(" ","-");

	    cmdArgs += "'https://youtu.be/" + playingVideo + "/' '" + filename + "' ";
	    if (Object.keys(pausedIds).length == numIds && Object.values(pausedIds).every(v => v === true)) console.info(cmdArgs);
	}
    });   
}
