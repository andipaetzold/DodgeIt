DodgeIt.prototype.gameplay_start = function(container)
{
    var game = playground({
        width: this.container.width(),
        height: this.container.height(),

        container: container.get(0),

        step: function(delta)
        {
            var that = this;

            // inc time
            this.time += delta;

            // move character
            if (this.keyboard.keys.left && !this.keyboard.keys.right)
            {
                this.character.x -= 300 * delta;
            }
            else if (!this.keyboard.keys.left && this.keyboard.keys.right)
            {
                this.character.x += 300 * delta;
            }

            // check new position
            this.character.x = Math.max(this.character.x, this.sidebar.width);
            this.character.x = Math.min(this.character.x, this.width - this.character.width);

            // create obstacle
            if (this.obstacles.length == 0 ||
                this.time - this.obstacles[this.obstacles.length - 1].spawntime >= 1.5) // spawn every 1.5 seconds
            {
                this.obstacles.push({
                    x: Math.floor(Math.random() * (this.width - this.sidebar.width - 50)) + this.sidebar.width,
                    y: -50,
                    width: 50,
                    height: 50,
                    spawntime: this.time
                });
            }

            // move obstacles down
            $.each(this.obstacles, function(index, value)
            {
                value.y += 100 * delta;
            });

            // remove obstacles
            this.obstacles = $.grep(this.obstacles, function(value)
            {
                return value.y < that.height;
            });
        },

        render: function()
        {
            var that = this;

            this.layer.clear("#FFFFFF");

            // character
            this.layer
                .fillStyle("#000000")
                .fillRect(this.character.x, this.height - this.character.height, this.character.width, this.character.height);

            // sidebar
            this.layer
                .fillStyle(this.sidebar.bordercolor)
                .fillRect(0, 0, this.sidebar.border, this.height)
                .fillRect(this.sidebar.width - this.sidebar.border, 0, this.sidebar.border + 1, this.height) // + 1 because of the grame around the canvas
                .fillRect(0, 0, this.sidebar.width, this.sidebar.border)
                .fillRect(0, this.height - this.sidebar.border, this.sidebar.width, this.sidebar.border);

            // text
            this.layer
                .fillStyle("#000000")
                .font("16px Arial")
                .wrappedText(Math.round(this.time).toString() + "s", 5, 16);

            // obstacles
            $.each(this.obstacles, function(index, value)
            {
                that.layer
                    .fillStyle("#000000")
                    .fillRect(value.x, value.y, value.width, value.height);
            });
        },

        // game screen properties
        sidebar: {
            width:  150,
            border: 2,
            bordercolor: "#000000"
        },

        // character
        character: {
            width:  64,
            height: 64,
            x: 0
        },

        // obstacles
        obstacles: [],

        // time
        time: 0
    });
};