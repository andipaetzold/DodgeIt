var Audio = {
    music: (function()
    {
        // VARS
        var max = 10;

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

        var options = {};

        // mute / volume
        Object.defineProperty(options, "mute", {
            get: function()
            {
                return audioElement.get(0).muted;
            },
            set: function(value)
            {
                audioElement.get(0).muted = value;
            }
        });
        options.mute = false;

        Object.defineProperty(options, "volume", {
            get: function()
            {
                return audioElement.get(0).volume * max;
            },
            set: function(value)
            {
                if (value >= 0 && value <= max)
                {
                    audioElement.get(0).volume = value / max;
                }
            }
        });
        options.volume = 5;

        // start music
        nexttrack();

        // RETURN
        return {
            options: options,
            nexttrack: nexttrack
        };
    })(),
    sfx: (function()
    {
        // VARS
        var max = 10;
        var mute = false;
        var volume = 5;

        var options = {};
        var sounds = {
            change: "sfx/change.mp3"
        };
        var audioElements = {};

        // FUNCTIONS
        var play = function(sound)
        {
            var audio = audioElements[sound].get(0);
            if (!audio.paused)
            {
                audio.pause();
                audio.currentTime = 0;
            }
            audio.play();
        };

        // INIT
        // mute
        Object.defineProperty(options, "mute", {
            get: function()
            {
                return mute;
            },
            set: function(value)
            {
                mute = value;

                // set mute
                $.each(audioElements, function(index, value)
                {
                    value.get(0).muted = mute;
                });
            }
        });

        // volume
        Object.defineProperty(options, "volume", {
            get: function()
            {
                return volume;
            },
            set: function(value)
            {
                volume = value;

                // set volume
                $.each(audioElements, function(index, value)
                {
                    value.get(0).volume = volume / max;
                });
            }
        });

        // create audio elements
        $.each(sounds, function(index, value)
        {
            audioElements[index] = $("<audio></audio>")
                .append(
                    $("<source>")
                        .attr("src", value)
                        .attr("type", "audio/mpeg")
                );
            audioElements[index].get(0).volume = volume / max;
        });

        // RETURN
        return {
            options:    options,
            play:       play
        };
    })()
};