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
            this.mute_set(false);
            this.volume_set(5);

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
            this.audioElement.get(0).muted = mute;
            this.parent.parent.save();
        },
        mute_get: function()
        {
            return this.audioElement.get(0).muted;
        },
        volume_set: function(volume)
        {
            if (volume >= 0 && volume <= this.max)
            {
                this.audioElement.get(0).volume = volume / this.max;
            }
            this.parent.parent.save();
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

        init: function(parent)
        {
            // set parent
            this.parent = parent;

            // init
            this.mute_set(false);
            this.volume_set(5);
        },
        play: function()
        {

        },
        mute_set: function(mute)
        {
            this.mute = mute;
            this.parent.parent.save();
        },
        mute_get: function()
        {
            return this.mute;
        },
        volume_set: function(volume)
        {
            this.volume = volume;
            this.parent.parent.save();
        },
        volume_get: function()
        {
            return this.volume;
        }
    }
};