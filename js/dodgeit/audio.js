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
                 track_cur = Math.floor(Math.random() * tracks.length);
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
                DodgeIt.save();
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
                if (value >= 0 && value <= this.max)
                {
                    audioElement.get(0).volume = value / max;
                }
                DodgeIt.save();
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
    sfx: {
        options: {
            mute: false,
            volume: 5            
        },
        max: 10,

        init: function()
        {
            // mute / volume
            Object.defineProperty(this, "mute", {
                get: function()
                {
                    return this.options.mute;
                },
                set: function(value)
                {
                    this.options.mute = value;
                    DodgeIt.save();
                }
            });
            this.mute = false;

            Object.defineProperty(this, "volume", {
                get: function()
                {
                    return this.options.volume;
                },
                set: function(value)
                {
                    this.options.volume = value;
                    DodgeIt.save();
                }
            });
            this.volume = 5;
        },

        play: function()
        {

        }
    }
};