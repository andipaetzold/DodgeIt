DodgeIt.prototype.audio = {
    music: {
        audioElement: null,
        init: function()
        {
            this.audioElement = $("<audio></audio");
            var that = this;
            this.audioElement.bind("timeupdate", function()
            {
                if (this.currentTime >= this.duration)
                {
                    that.next_track();
                }
            });

            // mute
            if ($.cookie("audio/music/mute"))
            {
                this.mute_set($.cookie("audio/music/mute"));
            }
            else
            {
                this.mute_set(false);
            }

            // volume
            if ($.cookie("audio/music/volume"))
            {
                this.volume_set($.cookie("audio/music/volume"));
            }
            else
            {
                this.volume_set(5);
            }

            // start music
            this.next_track();
        },

        max: 10,

        tracks: [
            "music/01_A_Night_Of_Dizzy_Spells.mp3",
            "music/02_Underclocked_(underunderclocked_mix).mp3",
            "music/03_Chibi_Ninja.mp3"
        ],
        track_cur: -1,

        next_track: function()
        {
            if (this.track_cur == -1)
            {
                 this.track_cur = Math.floor(Math.random() * this.tracks.length);
            }
            else
            {
                this.track_cur = (this.track_cur + 1) % this.tracks.length;
            }

            this.audioElement.get(0).pause();
            this.audioElement
                .empty()
                .append(
                    $("<source>")
                        .attr("src", this.tracks[this.track_cur])
                        .attr("type", "audio/mpeg")
                );
            this.audioElement.get(0).play();
        },
        mute_set: function(mute)
        {
            $.cookie("audio/music/mute", mute);
            this.audioElement.get(0).muted = mute;
        },
        mute_get: function()
        {
            return this.audioElement.get(0).muted;
        },
        volume_set: function(volume)
        {
            $.cookie("audio/music/volume", volume);
            if (volume >= 0 && volume <= this.max)
            {
                this.audioElement.get(0).volume = volume / this.max;
            }
        },
        volume_get: function()
        {
            return this.audioElement.get(0).volume * this.max;
        }
    },
    sfx: {
        mute: false,
        max: 10,
        volume: 5,

        init: function()
        {
            // mute
            if ($.cookie("audio/sfx/mute"))
            {
                this.mute_set($.cookie("audio/sfx/mute"));
            }
            else
            {
                this.mute_set(false);
            }

            // volume
            if ($.cookie("audio/sfx/volume"))
            {
                this.volume_set($.cookie("audio/sfx/volume"));
            }
            else
            {
                this.volume_set(5);
            }
        },
        play: function()
        {

        },
        mute_set: function(mute)
        {
            $.cookie("audio/sfx/mute", mute);
            this.mute = mute;
        },
        mute_get: function()
        {
            return this.mute;
        },
        volume_set: function(volume)
        {
            $.cookie("audio/sfx/volume", volume);
            this.volume = volume;
        },
        volume_get: function()
        {
            return this.volume;
        }
    }
};