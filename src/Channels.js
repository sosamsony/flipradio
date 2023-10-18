import React from 'react';
import './Channels.css'

function Channels({ channels, activeChannel, setActiveChannel }) {
    return (
        <div id="channels">
            {channels.map((channel, i) => {
                let isActive = activeChannel && channel.id === activeChannel.id
                let hoverColor = makeHslCssStrFromHslColor(channel.colorAsHsl)
                let staleAccentColor = makeHslaCssStrFromHsla(channel.colorAsHsl.h, channel.colorAsHsl.s, channel.colorAsHsl.l, 0.2)
                let activeChannelColor = makeHslCssStrFromHslColor(channel.colorAsHsl)

                return (
                    <div className='channelsListElem' id={'channelElem' + channel.id} key={channel.id}
                        style={{ '--elem-accent': staleAccentColor, '--channel-hover-color': hoverColor, '--active-channel-color': activeChannelColor }}
                        data-active={isActive}>
                        <a href={'#' + channel.anchor} data-title={channel.name} onClick={(e) => setActiveChannel(channel)}>{channel.name}</a>
                        {isActive && activeMarker()}
                    </div>
                );
            })}
        </div>
    )

    function activeMarker() {
        return (
            <div className="active-marker-container">
                <svg style={{ position: "absolute", bottom: "0px" }} viewBox="0 0 122.9 63.9">
                    <polygon points="61.4 0 122.9 63.9 0 63.9 61.4 0"></polygon>
                </svg>
            </div>
        )
    }

    function makeHslCssStrFromHsl(h, s, l) {
        return 'hsl(' + h + ',' + s + '%,' + l + '%)'
    }

    function makeHslaCssStrFromHsla(h, s, l, a) {
        return 'hsl(' + h + ',' + s + '%,' + l + '%,' + a + ')'
    }

    function makeHslCssStrFromHslColor(c) {
        return makeHslCssStrFromHsl(c.h, c.s, c.l)
    }

}

export default Channels