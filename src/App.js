import React, { useEffect, useState } from 'react';
import './App.css';
import './Channels'
import Channels from "./Channels";
import FipPlayingSongTracker from './fipPlayingSongTracker'
import LyricsService from './queryLyrics.js'
import Theme from './Theme'
import MadeByLink from './MadeByLink'; // Import the new component

var isDevMode = window.location.hostname === "localhost"

var playingTracker = null

const theme = new Theme()

const lyricsService =
  isDevMode
    ? new LyricsService("http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect")
    : new LyricsService()

const baseListenUrl = 'https://icecast.radiofrance.fr/'
const channels =
  [
    { name: 'fip', anchor: 'fip', id: 7, listenUrl: baseListenUrl + 'fip-hifi.aac', colorAsHsl: { h: 328, s: 100, l: 44 } },
    { name: 'rock', anchor: 'rock', id: 64, listenUrl: baseListenUrl + 'fiprock-hifi.aac', colorAsHsl: { h: 355, s: 94, l: 59 } },
    { name: 'jazz', anchor: 'jazz', id: 65, listenUrl: baseListenUrl + 'fipjazz-hifi.aac', colorAsHsl: { h: 182, s: 76, l: 31 } },
    { name: 'groove', anchor: 'groove', id: 66, listenUrl: baseListenUrl + 'fipgroove-hifi.aac', colorAsHsl: { h: 255, s: 80, l: 66 } },
    { name: 'pop', anchor: 'pop', id: 78, listenUrl: baseListenUrl + 'fippop-hifi.aac', colorAsHsl: { h: 141, s: 60, l: 39 } },
    { name: 'électro', anchor: 'electro', id: 74, listenUrl: baseListenUrl + 'fipelectro-hifi.aac', colorAsHsl: { h: 190, s: 100, l: 50 } },
    { name: 'monde', anchor: 'monde', id: 69, listenUrl: baseListenUrl + 'fipworld-hifi.aac', colorAsHsl: { h: 35, s: 85, l: 58 } },
    { name: 'reggae', anchor: 'reggae', id: 71, listenUrl: baseListenUrl + 'fipreggae-hifi.aac', colorAsHsl: { h: 114, s: 27, l: 36 } },
    { name: 'nouveautés', anchor: 'nouveautes', id: 70, listenUrl: baseListenUrl + 'fipnouveautes-hifi.aac', colorAsHsl: { h: 217, s: 84, l: 57 } },
    { name: 'metal', anchor: 'metal', id: 77, listenUrl: baseListenUrl + 'fipmetal-hifi.aac', colorAsHsl: { h: 257, s: 29, l: 55 } },
  ]

function App() {
  const [activeChannel, setActiveChannel] = useState(getActiveChannelFromUrl() ?? channels[0]);
  const [playing, setPlaying] = useState(null)
  const [lyricsInfo, setLyricsInfo] = useState(null)
  const [lyricsTextColumns, setLyricsTextColumns] = useState([])
  const [mailLink, setMailLink] = useState('') // empty string so link appears clickable

  // one-time ui initialization
  useEffect(() => {
    // set text container's max width to the max width of the menu bar
    let elem = document.querySelector(".channelsMaxWidth")
    if (elem) {
      let maxWidth = calcChannelsMenuWidth().toFixed(2) + 'px'
      elem.style.maxWidth = maxWidth
    }

    focusActiveChannel()
  }, [])

  // one-time song tracker initialization
  if (!playingTracker) {
    playingTracker = new FipPlayingSongTracker(activeChannel?.id, isDevMode)
    playingTracker.start()
  }

  // one-time subscribe to playingTracker to receive changes of playing
  useEffect(() => {
    console.log('useEffect [] // subscribe to playingTracker')
    let onPlayingChanged = p => {
      // check if it really changed (passing in the prev object prevents further effect calls)
      // handler might also be called with the same data (but different object id)
      setPlaying(prev => JSON.stringify(p) === JSON.stringify(prev) ? prev : p)
   }
    playingTracker.subscribe(onPlayingChanged)
    return () => { playingTracker.unsubscribe(onPlayingChanged) }
  }, []) // empty arr to make it run only once

  // when lyrics request comes back
  useEffect(() => {
    let lyricsColumns = lyricsInfo ? tryColumnizeText(lyricsInfo?.lyrics) : []
    setLyricsTextColumns(lyricsColumns)
  }, [lyricsInfo])

  // when channel changes
  useEffect(() => {
    console.log('useEffect [activeChannel]')
    // setting active channel on tracker, but not calling setPlaying(null) in this handler, this is done in playingTracker's change handler,
    // because playingTracker delays the change notification a bit to enable seamless (gapless) transition between channels
    playingTracker.activeChannelId = activeChannel?.id
  }, [activeChannel])

  // when playing changes
  useEffect(() => {
    console.log('useEffect [playing]')
    // clear lyrics
    setLyricsInfo(null)

    // request lyrics
    async function getLyricsInfoAsync() {
      // when react v18 is released, look at using Suspense: https://reactjs.org/docs/concurrent-mode-suspense.html
      if (playing?.isValid) {
        let playingBeforeRequest = playing
        let lyricsResult = await lyricsService.queryLyrics(playingBeforeRequest.artist, playingBeforeRequest.song)

        // fake lyrics result for testing
        // lyricsResult = {success : true, lyricsInfo : { lyricsSourceLink: 'test',  lyrics: "this is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\nthis is a nice small line\r\n"}}

        // check that the song playing hasn't changed while we were waiting for the lyrics
        let isPlayingSameAsBeforeQuery = playing && playingBeforeRequest.artist === playing?.artist && playingBeforeRequest.song === playing?.song
        if (isPlayingSameAsBeforeQuery) {
          if (lyricsResult?.success) {
            setLyricsInfo(lyricsResult.lyricsInfo)
          } else {
            console.log('lyrics error: ' + lyricsResult.error)
          }
        } else {
          console.log("playing changed while waiting for lyrics")
        }
      }
    }

    getLyricsInfoAsync()
  }, [playing])

  return (
    <div className="App">

      <div className="titleLineContainer">
        <h1 className="title" title="unofficial site for fip.fr radio" style={{ '--active-channel-color': activeChannelColor() }}>Fip Radio Lyrics</h1>

        <audio id="player" controls autoPlay src={activeChannel?.listenUrl}></audio>

        <div className="miscButtons" data-nosnippet="">
          {/* setting font-size, because having different font size as the buttons messes up icon alignment between button and link images */}
          <a id="spotifyLink" disabled={!playing?.isValid} target="_blank" rel="noopener noreferrer" title="current song on Spotify" className="iconBtn" href={spotifyLink(playing)}>
            <svg viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"></path>
            </svg>
          </a>

          <button title="toggle dark mode" onClick={() => theme.toggleDarkMode()} className="iconBtn">
            <svg viewBox="0 0 24 24">
              <path d="M0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm2 0c0-5.514 4.486-10 10-10v20c-5.514 0-10-4.486-10-10z"></path>
            </svg>
          </button>

          {/* antispam: set mail href on click */}
          <a title="contact" href={mailLink} onClick={setMailLinkToContactMail} className="iconBtn">
            <svg viewBox="0 0 24 24">
              <path d="M12.042 23.648c-7.813 0-12.042-4.876-12.042-11.171 0-6.727 4.762-12.125 13.276-12.125 6.214 0 10.724 4.038 10.724 9.601 0 8.712-10.33 11.012-9.812 6.042-.71 1.108-1.854 2.354-4.053 2.354-2.516 0-4.08-1.842-4.08-4.807 0-4.444 2.921-8.199 6.379-8.199 1.659 0 2.8.876 3.277 2.221l.464-1.632h2.338c-.244.832-2.321 8.527-2.321 8.527-.648 2.666 1.35 2.713 3.122 1.297 3.329-2.58 3.501-9.327-.998-12.141-4.821-2.891-15.795-1.102-15.795 8.693 0 5.611 3.95 9.381 9.829 9.381 3.436 0 5.542-.93 7.295-1.948l1.177 1.698c-1.711.966-4.461 2.209-8.78 2.209zm-2.344-14.305c-.715 1.34-1.177 3.076-1.177 4.424 0 3.61 3.522 3.633 5.252.239.712-1.394 1.171-3.171 1.171-4.529 0-2.917-3.495-3.434-5.246-.134z"></path>
            </svg>
          </a>
        </div>
      </div>

      <Channels
        channels={channels}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel} />

      <div id="songDetails" className="channelsMaxWidth" style={{ clear: "both", padding: "24px 0px" }} data-nosnippet>

        <div id="songInfo">
          <div id="songArtist">{playing?.artist}</div>
          <div id="songTitle">{playing?.song}</div>
        </div>

        {lyricsInfo &&
          <>
            <div id="lyrics">
              {/* marginRight must be on first col (marginLefton right col would not be left aligned if cols are wrapped) */}
              <div id="lyrics-col1" style={{ marginRight: "40px" }}>{lyricsTextColumns.length > 0 && lyricsTextColumns[0]}</div>
              {lyricsTextColumns.length > 1 &&
                <div id="lyrics-col2">{lyricsTextColumns[1]}</div>
              }
            </div>
            {lyricsInfo?.lyricsSourceLink &&
              <a id="lyricsSourceLink" href={lyricsInfo?.lyricsSourceLink} target="_blank" rel="noopener noreferrer">source: chartlyrics.com</a>
            }
          </>
        }

      </div>
      <MadeByLink /> 
    </div>
    
  );

  function calcChannelsMenuWidth() {
    // sum up menu part widths to get whole menu width 
    let channelsMenuWidth = 0.0
    let channelsList = document.getElementById('channels')
    for (let i = 0; i < channelsList.children.length; i++) {
      channelsMenuWidth += channelsList.children[i].getBoundingClientRect().width
    }
    return channelsMenuWidth
  }

  function getActiveChannelFromUrl() {
    // anchor name comes after a hash, for example id 'rock' is extracted from this url www.url.com/foo#rock
    let anchor = window.location.hash.substr(1)
    if (anchor) {
      let found = channels.find(c => c.anchor === anchor)
      if (found)
        return found
    }
    return null
  }

  function activeChannelColor() {
    return activeChannel
      ? makeHslCssStrFromHslColor(activeChannel?.colorAsHsl)
      : 'var(--fg-color)'
  }

  function makeHslCssStrFromHsl(h, s, l) {
    return 'hsl(' + h + ',' + s + '%,' + l + '%)'
  }

  function makeHslCssStrFromHslColor(c) {
    return makeHslCssStrFromHsl(c.h, c.s, c.l)
  }

  function spotifyLink(playing) {
    if (!playing)
      return null

    let searchStr = 'artist:' + playing.artist + ' track:' + playing.song
    let spotifyLink = 'https://play.spotify.com/search/' + encodeURIComponent(searchStr)
    return spotifyLink
  }

  function setMailLinkToContactMail() {
    // antispam
    let a = 'ma'
    let x = 'look.c'
    let m = 'zim_tigerclaw'.replace('_', '') + '\u0040out' + x + 'om'
    let o = 'o'
    let u = a + 'ilt' + o + ':' + m
    setMailLink(u)
  }

  function focusActiveChannel() {
    let activeChannelLink = document.querySelector('div[data-active=true] a');
    console.log("???? " + activeChannelLink)
    if (activeChannelLink) {
      activeChannelLink.focus()
      // blur() to hide visual focus helper
      activeChannelLink.blur()
    }
  }

  // returns array of text columns
  function tryColumnizeText(lyricsUiText) {
    // attempt to use multiple columns 
    const minNewlinesToUseColumns = 24
    // eslint-disable-next-line
    const newlineRegex = new RegExp('\r?\n', 'g')
    const matches = Array.from(lyricsUiText.matchAll(newlineRegex))

    if (matches && matches.length >= minNewlinesToUseColumns) {
      let m = Math.floor(matches.length / 2)
      let middleNewlineLength = matches[m][0].length
      // added newline length because we need to include the newline in the first column (in case of flex wrap)
      let middleTxtPos = matches[m].index + middleNewlineLength
      let secondHalf = lyricsUiText.substring(middleTxtPos, lyricsUiText.length)

      // prefer to cut off at empty line (prettier because blocks stay together)
      // eslint-disable-next-line
      let emptyLineRegex = new RegExp('(\r?\n){2}')
      let ma = secondHalf.match(emptyLineRegex)
      if (ma && ma.index && ma.length > 0) {
        let isNotTooFarNearTheEnd = ma.index < (secondHalf.length - (secondHalf.length * 0.6))
        if (isNotTooFarNearTheEnd) {
          // add to middle pos because we've search only in second half, but want the absolute pos
          // add double newline length to first part in case the 2nd column is flex-wrapped onto the first. Then we have a newline there as if we had it in one column.
          middleTxtPos = middleTxtPos + ma.index + ma[0].length
        }
      }

      let firstColTxt = lyricsUiText.substring(0, middleTxtPos)
      let secondColTxt = lyricsUiText.substring(middleTxtPos, lyricsUiText.length)
      return [firstColTxt, secondColTxt]
    }
    else { // fallback: use only first column
      return [lyricsUiText]
    }
  }

}

export default App;
