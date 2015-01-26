DodgeIt.prototype.audio = {
    init: function(parent)
    {
        // set parent
        this.parent = parent;

        // init
        this.music.init(this);
        this.sfx.init(this);
    },

    music: {
        audioElement: null,
        init: function(parent)
        {
            // set parent
            this.parent = parent;

            // init
            this.audioElement = $("<audio></audio");
            var that = this;
            this.audioElement.bind("ended", function()
            {
                that.next_track();
            });

            // mute / volume
            Object.defineProperty(this, "mute", {
                get: function()
                {
                    return this.audioElement.get(0).muted;
                },
                set: function(value)
                {
                    this.audioElement.get(0).muted = value;
                    this.parent.parent.save();
                }
            });
            this.mute = false;

            Object.defineProperty(this, "volume", {
                get: function()
                {
                    return this.audioElement.get(0).volume * this.max;
                },
                set: function(value)
                {
                    if (value >= 0 && value <= this.max)
                    {
                        this.audioElement.get(0).volume = value / this.max;
                    }
                    this.parent.parent.save();
                }
            });
            this.volume = 5;

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
        }
    },
    sfx: {
        options: {
            mute: false,
            volume: 5            
        },
        max: 10,

        init: function(parent)
        {
            // set parent
            this.parent = parent;

            // init
            // mute / volume
            Object.defineProperty(this, "mute", {
                get: function()
                {
                    return this.options.mute;
                },
                set: function(value)
                {
                    this.options.mute = value;
                    this.parent.parent.save();
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
                    this.parent.parent.save();
                }
            });
            this.volume = 5;
        },

        play: function()
        {

        }
    }
};