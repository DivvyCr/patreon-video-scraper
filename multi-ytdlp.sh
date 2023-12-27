# Usage:
#   multi-ytdlp 'https://youtu.be/identifier' 'output_filename'
multi-ytdlp () {
    for ((i=1; i<$#; i+=2)); do
	yt-dlp $@[i] -x --audio-format mp3 -o $@[i+1] > /dev/null &
    done
}
