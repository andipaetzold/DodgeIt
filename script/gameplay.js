DodgeIt.prototype.gameplay_start = function(container)
{
    var game = playground({
        width: this.container.width(),
        height: this.container.height(),

        container: container.get(0),

        create: function()
        {
            // background-image
            this.loadImages("road");
            var  scale = (this.width - this.sidebar.width) / this.images.road.naturalWidth;
            this.background = {
                img: this.images.road,
                x: this.sidebar.width,
                y: 0,
                width: this.images.road.naturalWidth * scale,
                height: this.images.road.naturalHeight * scale
            };
        },

        step: function(delta)
        {
            var that = this;

            // inc time
            this.time += delta;

            // move background-image
            this.background.y = (this.background.y + (100 * delta)) % this.background.height;

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

            // clear
            this.layer.clear("#FFFFFF");

            // background-image
            var y = this.background.y - this.background.height;
            while (y < this.height)
            {
                this.layer.drawImage(this.background.img,
                                     this.background.x, y,
                                     this.background.width, this.background.height);

                y += this.background.height - 1; // -1, because of the gap                
            }

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
            width:  Math.floor(this.container.width() / 3.5),
            border: 2,
            bordercolor: "#000000"
        },

        // background
        background: null,

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