var initialised = false;
var cmdArgs;
var idToVid;
var pausedIds;
var numIds;

// Listen for the background script,
// which sends a message when the extension is run:
browser.runtime.onMessage.addListener(runExtension);

function runExtension(req, sender, res) {
    // Reset data variables:
    cmdArgs = "";
    idToVid = {};
    pausedIds = {};

    // Exactly one message listener:
    if (!initialised) {
	initMessageListener();
	initialised = true;
    }

    // Click on every `media-container`, which will activate embedded YouTube videos:
    let containers = document.querySelectorAll("[data-tag='media-container']");
    for (var i=0; i<containers.length; i++) containers[i].click();
    numIds = containers.length; // Necessary to know when all data was collected.
}

function initMessageListener() {
    /*
      The YouTube embedded player actively communicates with the webpage via messages, including:
      - an 'initialDelivery' message when an `iframe` is initialised (first message, exactly once);
      - an 'infoDelivery' message when an `iframe` receives more video data (extremely often);
      - an 'onStateChange' message when the `iframe` state changes (eg. from playing to paused).

      The YouTube embedded player can also be issued commands via messages of the form:
        { "event": "command", "func": "API_FUNCTION", "args": "ARGS_TO_FUNCTION" }
      I do not know where it is documented, but I repeatedly found this on forums and it works.

      I found that issuing commands immediately after receiving an 'initialDelivery' message is
      unreliable, so instead I only issue a command on receiving an 'infoDelivery' message. However,
      in order to avoid spamming commands, I use the `pausedIds` map to track which YouTube players
      were sent a message already. Notably, the 'infoDelivery' message does not hold the Video ID,
      so I also use an `idToVid` map to keep track (it is initialised during 'initialDelivery').
    */

    addEventListener("message", (e) => {
	const edata = JSON.parse(e.data);
	if (edata["event"] === "initialDelivery") {
	    // Initialise helper maps for this player:
	    idToVid[edata["id"]] = edata["info"]["videoData"]["video_id"];
	    pausedIds[edata["id"]] = false;
	} else if (edata["event"] === "infoDelivery" && !pausedIds[edata["id"]]) {
	    // Fetch the Video ID from the map, and use it to locate the `iframe`:
	    let playingVideo = idToVid[edata["id"]];
	    let frame = document.querySelector("iframe[src*='" + playingVideo + "']");
	    // Send the 'pauseVideo' command to the player:
	    pausedIds[edata["id"]] = true; // Mark this player as paused to avoid repeated messaging.
	    frame.contentWindow.postMessage('{"event":"command", "func":"pauseVideo", "args":""}', '*');

	    //
	    // Parse and format data for output.
	    // 

	    let post = frame.parentElement.parentElement;
	    let postTitle = post.querySelector("[data-tag='post-title']").innerText
		.trim().replaceAll(/['.,!?]/g,"").replaceAll("/"," ");

	    let postDate = post.querySelector("[data-tag='post-published-at']").innerText;
	    let formattedDate;
	    if (postDate.includes("ago")) {
		// Patreon uses relative times only for: seconds, minutes, hours, and days;
		// so the date is either today or 1-7 days ago:
		formattedDate = new Date();
		if (postDate.includes("days")) {
		    formattedDate.setDate(formattedDate.getDate() - postDate.split(' ')[0]);
		}
	    } else {
		// Patreon omits the year if the post is from the current year;
		// in general, it formats dates as: Month DD[, YYYY]
		if (postDate.split(',').length < 2) postDate += ", " + new Date().getFullYear();   
		formattedDate = new Date(Date.parse(postDate));
	    }

	    // Convert Unix time to YYYY-MM-DD and append the post title to form the filename:
	    let filename = formattedDate.toISOString().split('T')[0] + "_" + postTitle.replaceAll(" ","-");

	    // Append this video's URL and filename to `cmdArgs`:
	    cmdArgs += "'https://youtu.be/" + playingVideo + "/' '" + filename + "' ";

	    // If all videos have been processed (ie. paused), output `cmdArgs`:
	    if (Object.keys(pausedIds).length == numIds &&
		Object.values(pausedIds).every(v => v === true)) {
		console.info(cmdArgs);
	    }
	}
    });   
}
