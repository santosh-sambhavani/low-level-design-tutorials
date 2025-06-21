class Song {
    constructor(name: string) {
        this.id = Math.random().toString(36).substring(2, 15);
        this.name = name;
    }
    public name: string;
    public id: string;
}

class PlayList {
    constructor(name: string) {
        this.id = Math.random().toString(36).substring(2, 15);
        this.name = name;
    }
    public name: string;
    public id: string;
    public songs: Map<string, Song> = new Map<string, Song>();
}

/**
 * ================ PlayList management section starts. ================
 */

class PlayListManager {
    private static instance: PlayListManager;
    private playlists: Map<string, PlayList>;
    private constructor() {
        this.playlists = new Map<string, PlayList>();
    }
    public static getInstance(): PlayListManager {
        if (!this.instance) {
            this.instance = new PlayListManager();
        }
        return this.instance;
    }
    public createPlaylist(name: string): PlayList {
        const playlist = new PlayList(name);
        this.playlists.set(playlist.id, playlist);
        console.log(`Playlist "${name}" created with ID: ${playlist.id}`);
        return playlist;
    }
    public getPlaylists(): PlayList[] {
        return Array.from(this.playlists.values());
    }
    public getPlaylistById(id: string): PlayList | undefined {
        return this.playlists.get(id);
    }
    public addSongToPlaylist(playlistId: string, song: Song): void {
        const playlist = this.getPlaylistById(playlistId);
        if (!playlist) {
            console.log(`Playlist with ID ${playlistId} not found.`);
            return;
        }
        playlist.songs.set(song.id, song);
        console.log(`Song "${song.name}" added to playlist "${playlist.name}".`);
    }
    public removeSongFromPlaylist(playlistId: string, songId: string): void {
        const playlist = this.getPlaylistById(playlistId);
        if (!playlist) {
            console.log(`Playlist with ID ${playlistId} not found.`);
            return;
        }
        if (playlist.songs.delete(songId)) {
            console.log(`Song with ID ${songId} removed from playlist "${playlist.name}".`);
        } else {
            console.log(`Song with ID ${songId} not found in playlist "${playlist.name}".`);
        }
    }
    public listSongsInPlaylist(playlistId: string): Song[] {
        const playlist = this.getPlaylistById(playlistId);
        if (!playlist) {
            console.log(`Playlist with ID ${playlistId} not found.`);
            return [];
        }
        return Array.from(playlist.songs.values());
    }
}

abstract class IPlayListStrategy {
    abstract playAllSongs(playlist: PlayList): void
    addSongToQueue(song: Song): void {}
    removeSongFromQueue(songId: string): void {}
}

enum PlayListStrategyMode {
    Sequential = 'sequential',
    Random = 'random',
}

class SequentialPlayListStrategy extends IPlayListStrategy {
    public playAllSongs(playlist: PlayList): void {
        console.log(`Playing all songs in playlist "${playlist.name}" sequentially:`);
        playlist.songs.forEach(song => {
            console.log(`- ${song.name}`);
        });
    }
}

class RandomPlayListStrategy extends IPlayListStrategy {
    public playAllSongs(playlist: PlayList): void {
        const songsArray = Array.from(playlist.songs.values());
        console.log(`Playing all songs in playlist "${playlist.name}" randomly:`);
        for (let i = songsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [songsArray[i], songsArray[j]] = [songsArray[j], songsArray[i]];
        }
        songsArray.forEach(song => {
            console.log(`- ${song.name}`);
        });
    }
}

class PlayListContext {
    private strategy: IPlayListStrategy;

    constructor(strategy: IPlayListStrategy) {
        this.strategy = strategy;
    }

    public setStrategy(strategy: IPlayListStrategy): void {
        this.strategy = strategy;
    }

    public getStrategy(): IPlayListStrategy {
        return this.strategy;
    }
}

/**
 * ================ PlayList management section ends. ================
 */

/**
 * ================ Device management section starts. ================
 */

abstract class IAudioOutputDevice {
    public abstract playAudio(song: Song): void;
}

class BluetoothDeviceAdapter extends IAudioOutputDevice {
    private bluetoothDeviceApi: BluetoothDeviceApi;
    constructor() {
        super();
        this.bluetoothDeviceApi = new BluetoothDeviceApi();
    }
    public playAudio(song: Song) {
        this.bluetoothDeviceApi.playOnBluetoothDevice(song);
    }
}

class BluetoothDeviceApi {
    public playOnBluetoothDevice(song: Song) {
        console.log(`Playing song ${song.name} on Bluetooth device API`);
    }
}

class WiredDeviceAdapter extends IAudioOutputDevice {
    private wiredDeviceApi: WiredDeviceApi;
    constructor() {
        super();
        this.wiredDeviceApi = new WiredDeviceApi();
    }
    public playAudio(song: Song) {
        this.wiredDeviceApi.playOnWiredDevice(song);
    }
}

class WiredDeviceApi {
    public playOnWiredDevice(song: Song) {
        console.log(`Playing song ${song.name} on Wired device API`);
    }
}

class DeviceSpeakerAdapter extends IAudioOutputDevice {
    private deviceSpeakerApi: DeviceSpeakerApi;
    constructor() {
        super();
        this.deviceSpeakerApi = new DeviceSpeakerApi();
    }
    public playAudio(song: Song) {
        this.deviceSpeakerApi.playOnDevice(song);
    }
}

class DeviceSpeakerApi {
    public playOnDevice(song: Song) {
        console.log(`Playing song ${song.name} on Device Speaker API`);
    }
}

enum DeviceType {
    Bluetooth = 'bluetooth',
    Wired = 'wired',
    DeviceSpeaker = 'deviceSpeaker',
}

class DeviceFactory {
    public static createDevice(type?: DeviceType): IAudioOutputDevice {
        if (type === DeviceType.Bluetooth) {
            return new BluetoothDeviceAdapter();
        } else if (type === DeviceType.Wired) {
            return new WiredDeviceAdapter();
        } else {
            return new DeviceSpeakerAdapter();
        }
    }
}

class DeviceManager {
    private static instance: DeviceManager;
    private connectedDevice: IAudioOutputDevice = DeviceFactory.createDevice(); // Default to DeviceSpeaker

    private constructor() {}
    public static getInstance(): DeviceManager {
        if (!this.instance) {
            this.instance = new DeviceManager();
        }
        return this.instance;
    }
    public connectDevice(device: DeviceType): void {
        this.connectedDevice = DeviceFactory.createDevice(device);
        console.log(`Connected to ${device} device.`);
    }

    public getConnectedDevice(): IAudioOutputDevice {
        return this.connectedDevice;
    }
}


/**
 * ================ Device management section ends. ================
 */

/** =========== Song manager starts =========== */

class SongManager {
    private static instance: SongManager;
    private songs: Map<string, Song>; // instead this will be stored in db

    private constructor() {
        this.songs = new Map<string, Song>();
    }

    public static getInstance(): SongManager {
        if (!this.instance) {
            this.instance = new SongManager();
        }
        return this.instance;
    }

    public addSong(name: string): void {
        const song = new Song(name);
        this.songs.set(song.id, song);
    }
    
    public getSongs(): Song[] {
        return Array.from(this.songs.values());
    }

    public getSongById(id: string): Song | undefined {
        return this.songs.get(id);
    }
}

/** =========== Song manager ends =========== */

/** =========== Media player facade starts =========== */

class MediaPlayerFacade {
    private songManager: SongManager;
    private playlistManager: PlayListManager;
    private currentSong: Song | null = null;
    private deviceManager: DeviceManager;
    private playListContext: PlayListContext;

    constructor() {
        this.songManager = SongManager.getInstance();
        this.playlistManager = PlayListManager.getInstance();
        this.deviceManager = DeviceManager.getInstance();
        this.playListContext = new PlayListContext(new SequentialPlayListStrategy());
        console.log("Media Player Facade initialized.");
    }

    public uploadSong(name: string): void {
        this.songManager.addSong(name);
        console.log(`Song "${name}" uploaded successfully.`);
    }

    public connectDevice(deviceType: DeviceType): void {
        this.deviceManager.connectDevice(deviceType);
    }

    public playSong(id: string): void {
        const song = this.songManager.getSongById(id);
        if (!song) {
            console.log(`Song "${name}" not found.`);
            return;
        }
        this.currentSong = song;
        const device = this.deviceManager.getConnectedDevice();
        device.playAudio(song);
    }

    public pauseSong(): void {
        if (!this.currentSong) {
            console.log("No song is currently playing.");
            return;
        }
        console.log(`Pausing song "${this.currentSong.name}".`);``
        this.currentSong = null; // Reset current song
    }

    public listSongs(): Song[] {
        return this.songManager.getSongs();
    }

    public createPlaylist(name: string): PlayList {
        return this.playlistManager.createPlaylist(name);
    }

    public addSongToPlaylist(playlistId: string, songId: string): void {
        const song = this.songManager.getSongById(songId);
        if (!song) {
            console.log(`Song with ID ${songId} not found.`);
            return;
        }
        this.playlistManager.addSongToPlaylist(playlistId, song);
    }

    public removeSongFromPlaylist(playlistId: string, songId: string): void {
        this.playlistManager.removeSongFromPlaylist(playlistId, songId);
    }

    public listSongsInPlaylist(playlistId: string): Song[] {
        return this.playlistManager.listSongsInPlaylist(playlistId);
    }

    public playAllSongsInPlaylist(playlistId: string): void {
        const playlist = this.playlistManager.getPlaylistById(playlistId);
        if (!playlist) {
            console.log(`Playlist with ID ${playlistId} not found.`);
            return;
        }
        this.playListContext?.getStrategy().playAllSongs(playlist);
    }

    public setPlaylistStrategy(mode: PlayListStrategyMode): void {
        let strategy: IPlayListStrategy;
        if (mode === PlayListStrategyMode.Random) {
            strategy = new RandomPlayListStrategy();
        } else {
            strategy = new SequentialPlayListStrategy();
        }
        this.playListContext.setStrategy(strategy);
        console.log(`Playlist strategy set to ${mode}`);
    }
}

/** =========== Media player facade ends =========== */

/** =========== Media player starts =========== */
class MediaPlayer {
    private mediaPlayerFacade: MediaPlayerFacade;
    constructor() {
        this.mediaPlayerFacade = new MediaPlayerFacade();
    }
    public uploadSong(name: string): void {
        this.mediaPlayerFacade.uploadSong(name);
    }
    public playSong(id: string): void {
        this.mediaPlayerFacade.playSong(id);
    }
    public pauseSong(): void {
        this.mediaPlayerFacade.pauseSong();
    }
    public getSongs(): Song[] {
        return this.mediaPlayerFacade.listSongs();
    }
    public connectDevice(deviceType: DeviceType): void {
        this.mediaPlayerFacade.connectDevice(deviceType);
    }
    public createPlaylist(name: string): PlayList {
        return this.mediaPlayerFacade.createPlaylist(name);
    }
    public addSongToPlaylist(playlistId: string, songId: string): void {
        this.mediaPlayerFacade.addSongToPlaylist(playlistId, songId);
    }
    public removeSongFromPlaylist(playlistId: string, songId: string): void {
        this.mediaPlayerFacade.removeSongFromPlaylist(playlistId, songId);
    }
    public listSongsInPlaylist(playlistId: string): Song[] {
        return this.mediaPlayerFacade.listSongsInPlaylist(playlistId);
    }
    public playAllSongsInPlaylist(playlistId: string): void {
        this.mediaPlayerFacade.playAllSongsInPlaylist(playlistId);
    }
    public setPlaylistStrategy(mode: PlayListStrategyMode): void {
        this.mediaPlayerFacade.setPlaylistStrategy(mode);
    }
}

/** =========== Media player ends =========== */

// Example usage

console.log("\n=========== Upload songs ===========");
const mediaPlayer = new MediaPlayer();
mediaPlayer.uploadSong("Song 1");
mediaPlayer.uploadSong("Song 2");
mediaPlayer.uploadSong("Song 3");
mediaPlayer.uploadSong("Song 4");
mediaPlayer.uploadSong("Song 5");
mediaPlayer.uploadSong("Song 6");
mediaPlayer.uploadSong("Song 7");
mediaPlayer.uploadSong("Song 8");
mediaPlayer.uploadSong("Song 9");
mediaPlayer.uploadSong("Song 10");
mediaPlayer.uploadSong("Song 11");

console.log("\n=========== List songs ===========");
const songs = mediaPlayer.getSongs();
console.log("Available songs:", songs.map(song => song.name));

console.log("\n=========== Connect bluetooth device & play song ===========");
mediaPlayer.connectDevice(DeviceType.Bluetooth);
mediaPlayer.playSong(songs[0].id);
mediaPlayer.pauseSong();

console.log("\n=========== Connect wired device & play song ===========");
mediaPlayer.connectDevice(DeviceType.Wired);
mediaPlayer.playSong(songs[1].id);
mediaPlayer.pauseSong();

console.log("\n=========== Available songs after playback:", mediaPlayer.getSongs().map(song => song.name));

console.log("\n=========== Create playlist & add songs ===========");
const playlist = mediaPlayer.createPlaylist("My Playlist");
mediaPlayer.addSongToPlaylist(playlist.id, songs[0].id);
mediaPlayer.addSongToPlaylist(playlist.id, songs[1].id);
mediaPlayer.addSongToPlaylist(playlist.id, songs[2].id);
mediaPlayer.addSongToPlaylist(playlist.id, songs[3].id);
mediaPlayer.addSongToPlaylist(playlist.id, songs[4].id);
console.log("Songs in playlist:", mediaPlayer.listSongsInPlaylist(playlist.id).map(song => song.name));

console.log("\n=========== Play all songs in playlist sequentially ===========");
mediaPlayer.setPlaylistStrategy(PlayListStrategyMode.Sequential);
mediaPlayer.playAllSongsInPlaylist(playlist.id);

console.log("\n=========== Play all songs in playlist randomly ===========");
mediaPlayer.setPlaylistStrategy(PlayListStrategyMode.Random);
mediaPlayer.playAllSongsInPlaylist(playlist.id);

console.log("\n=========== Remove song from playlist ===========");
mediaPlayer.removeSongFromPlaylist(playlist.id, songs[0].id);
console.log("Songs in playlist after removal:", mediaPlayer.listSongsInPlaylist(playlist.id).map(song => song.name));
