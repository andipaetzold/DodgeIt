var Audio = {
    music: (function()
    {
        // VARS
        var tracks = [
            "music/01_A_Night_Of_Dizzy_Spells.mp3",
            "music/02_Underclocked_(underunderclocked_mix).mp3",
            "music/03_Chibi_Ninja.mp3"
        ];
        var track_cur = -1;
        var audioElement = null;

        // FUNCTIONS
        var nexttrack = function()
        {
            if (track_cur == -1)
            {
                 track_cur = Math.randomRange(0, tracks.length - 1, true);
            }
            else
            {
                track_cur = (track_cur + 1) % tracks.length;
            }

            audioElement.get(0).pause();
            audioElement
                .empty()
                .append(
                    $("<source>")
                        .attr("src", tracks[track_cur])
                        .attr("type", "audio/mpeg")
                );
            audioElement.get(0).play();
        };

        // INIT
        // audio element
        audioElement = $("<audio></audio").bind("ended", function()
        {
            nexttrack();
        });

        // mute / volume
        var tmpMute = DodgeIt.options.music.mute;
        Object.defineProperty(DodgeIt.options.music, "mute", {
            get: function()
            {
                return audioElement.get(0).muted;
            },
            set: function(value)
            {
                audioElement.get(0).muted = value;
            }
        });
        DodgeIt.options.music.mute = tmpMute;

        // volume
        var tmpVolume = DodgeIt.options.music.volume;
        Object.defineProperty(DodgeIt.options.music, "volume", {
            get: function()
            {
                return audioElement.get(0).volume;
            },
            set: function(value)
            {
                value = Math.max(0, Math.min(1, value));
                audioElement.get(0).volume = value;
            }
        });
        DodgeIt.options.music.volume = tmpVolume;

        // start music
        nexttrack();

        // RETURN
        return {
            nexttrack:  nexttrack
        };
    })(),
    sfx: (function()
    {
        // VARS
        var sounds = {
            change: "sfx/change.mp3",
            crash: "sfx/crash.mp3"
        };
        var audioElements = {};

        // FUNCTIONS
        var play = function(sound)
        {
            var audio = audioElements[sound].get(0);
            audio.play();
        };

        // INIT
        // create audio elements
        $.each(sounds, function(index, value)
        {
            var audio = $("<audio></audio>")
                .append(
                    $("<source>")
                        .attr("src", value)
                        .attr("type", "audio/mpeg")
                );
            audio.get(0).volume = 0;
            audioElements[index] = audio;
        });

        // mute
        var tmpMute = DodgeIt.options.sfx.mute;
        Object.defineProperty(DodgeIt.options.sfx, "mute", {
            get: function()
            {
                if (audioElements.length >= 1)
                {
                    return audioElements[0].get(0).muted;
                }
                else
                {
                    return false;
                }
            },
            set: function(mute)
            {
                // set mute
                $.each(audioElements, function(index, value)
                {
                    value.get(0).muted = mute;
                });
            }
        });
        DodgeIt.options.sfx.mute = tmpMute;

        // volume
        var tmpVolume = DodgeIt.options.sfx.volume;
        Object.defineProperty(DodgeIt.options.sfx, "volume", {
            get: function()
            {
                if (audioElements.length >= 1)
                {
                    return audioElements[0].get(0).volume;
                }
                else
                {
                    return 0.5;
                }
            },
            set: function(value)
            {
                value = Math.max(0, Math.min(1, value));

                // set volume
                $.each(audioElements, function(index, element)
                {
                    element.get(0).volume = value;
                });
            }
        });
        DodgeIt.options.sfx.volume = tmpVolume;

        // RETURN
        return {
            play:   play
        };
    })()
};