<h1 align="center">My workflow for downloading Patreon video content.</h1>

## Overview

The problem is that Patreon hides YouTube data behind a thumbnail &mdash; the data is fetched via JavaScript when the thumbnail is clicked, replacing it with an `iframe` holding the embedded YouTube player. Therefore, to avoid manual clicking of every thumbnail, I devised a script (ie. a Firefox extension) to do so and then immediately collect the YouTube links, post titles, and post dates. The links are used to download audio via [`yt-dlp`](https://github.com/yt-dlp/yt-dlp), and the data is used to reformat file names to `yyyy-mm-dd_Post-Title.mp3`.

In total, there are three stages to my workflow:
 1. Collect YouTube data from Patreon;
 2. Download YouTube audio from that data;
 3. (Optional) Transcribe audio for operations like summarising.

### Stage 1

*Relevant files: [patreon_extraction](https://github.com/DivvyCr/patreon-video-scraper/tree/main/patreon-extraction)*

<details><summary>**Set-up:**</summary>
 1. With **Firefox**, go to `about:debugging`; if you get redirected to Firefox documentation, you need to go to `about:config` and add/set the option `devtools.aboutdebugging.new-enabled` to `true`.
 2. In `about:debugging`, go to the 'This Firefox' section and then click 'Load Temporary Add-On'.
 3. In the file browser pop-up, select any file in the [patreon_extraction](https://github.com/DivvyCr/patreon-video-scraper/tree/main/patreon-extraction) directory.
 4. The plugin should now be loaded for this Firefox session.
</details>
 
<details><summary>**Usage:**</summary>
 1. Go to any **Patreon** feed that contains posts with **embedded YouTube videos**.
 2. Run the extension (called *Get Arguments to yt-dlp from Patreon Media*) from the toolbar.  
 ie. click the puzzle icon on the right-hand side of the toolbar, and click on the extension.
 3. Open the *Developer Console* by pressing `Ctrl+Shift+K` and copy the string of YouTube links and titles; the string is a collection of arguments to use in the next stage.  
 *Note:* if you do not see logs from the extension, try going to `about:config` and adding/setting the option `extensions.sdk.console.logLevel` to `all`.
</details>

### Stage 2

*Relevant files: [multi-ytdlp.sh](multi-ytdlp.sh)*

<details><summary>**Set-up:**</summary>
Run the [multi-ytdlp.sh](multi-ytdlp.sh) script.
</details>

<details><summary>**Usage:**</summary>
`multi-ytdlp 'https://youtu.be/identifier1' 'out1.mp3' 'https://youtu.be/identifier2' 'out2.mp3' ...`
</details>

### Stage 3

*Relevant files: [transcribe.py](transcribe.py)*

This is largely prototypical and reliant on external APIs. My use case is to summarise the audio and/or categorise it by keywords in order to organise the audio files better. Feel free to view the minimal scripts; I will not explain the set-ups of the external APIs.
