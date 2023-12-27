import os
from openai import OpenAI # pip install -U openai
from deepgram import DeepgramClient, PrerecordedOptions # pip install -U deepgram-sdk

deepgram = DeepgramClient()
options = PrerecordedOptions(model="nova-2", smart_format=True)

for filename in os.listdir("./audio-files/"):
    if (not filename.endswith(".mp3")):
        continue

    file_path = "./audio-files/" + filename
    with open(file_path, 'rb') as audio:
        source = {'buffer': audio}
        res = deepgram.listen.prerecorded.v("1").transcribe_file(source, options)

        content = res.results.channels[0].alternatives[0].transcript

        out_path = os.path.splitext(file_path)[0] + ".txt"
        print("From " + file_path + " to " + out_path + "...")
        with open(out_path, "w") as out_file:
            print(content, file=out_file)

        # chatgpt = OpenAI()
        # summary = chatgpt.chat.completions.create(
        #     model="gpt-4",
        #     messages=[
        #         {"role": "user", "content": "Summarise the following passage of text, provide three possible titles for it, and provide five keywords/topics about the text. The titles must be as short as possible, potentially consisting only of keywords.\n\n" + content}
        #     ]
        # )
        # print(summary)

