function Playing(artist, song) {
    this.artist = artist;
    this.song = song;
    this.isValid = artist !== null && artist !== '' && song !== null && song !== '';
    this.lyricsResult = null;
  }

// notifies subscribers of changes to the currently playing song
// users of this class must set activeChannelId
// might notify multiple times for same song (yagni)
// TODO: verify playing song is in time range on notify
export default class FipPlayingSongTracker {
    autoUpdateIntervalInMs = 6000
    updateTimeoutId = null
    observers = []
    _activeChannelId = null
    _lastFetchedPlayingJson = null
    _playingByChannelId = new Map()

    constructor(activeChannelId, isDevMode) {
        this._activeChannelId = activeChannelId
        this.isDevMode = isDevMode
    }

    set activeChannelId(activeChannelId) {
        if (this._activeChannelId === activeChannelId)
            return

        this._activeChannelId = activeChannelId
        this.notifySubscribers()
      }

      get activeChannelId() {
        return this._activeChannelId;
      }

    subscribe(observer) {
        this.observers.push(observer)
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(function(value, index, arr){ 
            return value !== observer;
        });
    }

    notifySubscribers() {
        let p = this._playingByChannelId.get(this.activeChannelId)
        this.observers.forEach(o => o(p))
    }
    
    async start() {
        try {
            console.log("playingTracker::update() " + this.activeChannelId)

            // clear last timer that might still be active
            clearTimeout(this.updateTimeoutId)
            this.updateTimeoutId = null

            let playingJson = await this.fetchPlayingJson()
            if (playingJson === this._lastFetchedPlayingJson)
                return
                
            // TODO is valid check
            this._lastFetchedPlayingJson = playingJson

            this._playingByChannelId = new Map(
                playingJson
                .filter(i => !isNaN(parseInt(i.id)))
                .map(i => [
                    parseInt(i.id), 
                    new Playing(i.live?.now?.secondLine, i.live?.now?.firstLine)
                    ])
                )

            this.notifySubscribers()
        } catch (error) {
            console.log(error)
        } finally {
            if (this.updateTimeoutId === null) {
                this.updateTimeoutId = setTimeout(() => this.start(), this.autoUpdateIntervalInMs)
                console.log('next update scheduled in finally in ' + this.autoUpdateIntervalInMs / 1000 + ' seconds')
            }
        }
    }

    async fetchPlayingJson() {
        console.log('fetching data')
        let url = 
            this.isDevMode 
            ? "https://www.radiofrance.fr/api/v2.1/stations/fip/live/webradios" 
            : "/latest/api"

        let response = await fetch(url, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        })

        if (!response)
            throw Error(`empty fetch response for url=${url}`)

        return await response.json()
    }

}
