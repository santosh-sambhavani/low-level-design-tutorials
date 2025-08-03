class MyVideoEncoder {
    encode(video: string): string {
        return `Encoding video: ${video}`;
    }
}

class MyAudioEncoder {
    encode(audio: string): string {
        return `Encoding audio: ${audio}`;
    }
}

class VideoConverter {
    private videoEncoder: MyVideoEncoder;
    private audioEncoder: MyAudioEncoder;

    constructor() {
        this.videoEncoder = new MyVideoEncoder();
        this.audioEncoder = new MyAudioEncoder();
    }

    convert(video: string, audio: string): string {
        const encodedVideo = this.videoEncoder.encode(video);
        const encodedAudio = this.audioEncoder.encode(audio);
        return `${encodedVideo} and ${encodedAudio}`;
    }
}

class VideoConverterFacade {
    public static run(video: string, audio: string): void {
        const converter = new VideoConverter();
        const result = converter.convert(video, audio);
        console.log(result);
    }
}

// usage
VideoConverterFacade.run("myVideo.mp4", "myAudio.mp3");