Game.prototype.audio = {
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
                    that.nextTrack();
                }
            });
            this.volume_change(5);
            this.nextTrack();
        },

        max: 10,

        tracks: [
            "music/01_A_Night_Of_Dizzy_Spells.mp3",
            "music/02_Underclocked_(underunderclocked_mix).mp3",
            "music/03_Chibi_Ninja.mp3"
        ],
        track_cur: -1,

        nextTrack: function()
        {
            if (this.track_cur == -1)
            {
                 this.track_cur = Math.floor(Math.random() * (this.tracks.length + 1));
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
        },
        mute_get: function()
        {
            return this.audioElement.get(0).muted;
        },
        volume_change: function(volume)
        {
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

        play: function()
        {

        },
        mute_set: function(mute)
        {
            this.mute = mute;
        },
        mute_get: function()
        {
            return this.mute;
        },
        volume_change: function(volume)
        {
            this.volume = volume;
        },
        volume_get: function()
        {
            return this.volume;
        }
    }
};