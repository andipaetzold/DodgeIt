DodgeIt.prototype.gameplay_start = function(container)
{
    var that = this;
    var game = playground({
        // size
        width: this.container.width(),
        height: this.container.height(),

        // container
        container: container.get(0),

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
            x: 0,
            y: 0, // calculated on start
            speed: 300
        },

        // obstacles
        obstacle: {
            width: 50,
            height: 50,
            speed: 100
        },
        obstacles: [],

        // game running?
        running: true,

        // time
        time: 0,

        // score
        score: 0,

        create: function()
        {
            // calc character y
            this.character.y = this.height - this.character.height;

            // background-image
            this.loadImages("road");
            var  scale = (this.width - this.sidebar.width) / this.images.road.naturalWidth;
            this.background = {
                img: this.images.road,
                x: this.sidebar.width,
                y: 0,
                width:  Math.round(this.images.road.naturalWidth * scale),
                height: Math.round(this.images.road.naturalHeight * scale)
            };
        },

        step: function(delta)
        {
            var that = this;

            if (this.running)
            {                
                // inc time
                this.time += delta;

                // inc score
                this.score += delta * 10;

                // move background-image
                this.background.y = (this.background.y + (this.obstacle.speed * delta)) % this.background.height;

                // move character
                if (this.keyboard.keys.left && !this.keyboard.keys.right)
                {
                    this.character.x -= this.character.speed * delta;
                }
                else if (!this.keyboard.keys.left && this.keyboard.keys.right)
                {
                    this.character.x += this.character.speed * delta;
                }

                // check new position
                this.character.x = Math.max(this.character.x, this.sidebar.width);
                this.character.x = Math.min(this.character.x, this.width - this.character.width);

                // create obstacle
                if (this.obstacles.length == 0 ||
                    this.time - this.obstacles[this.obstacles.length - 1].spawntime >= 1.5) // spawn every 1.5 seconds
                {
                    this.obstacles.push({
                        x: Math.floor(Math.random() * (this.width - this.sidebar.width - this.obstacle.width)) + this.sidebar.width,
                        y: -this.obstacle.height,
                        width: this.obstacle.width,
                        height: this.obstacle.height,
                        spawntime: this.time
                    });
                }

                // move obstacles / collision test
                $.each(this.obstacles, function(index, value)
                {
                    // move
                    value.y += that.obstacle.speed * delta;

                    // collision test
                    if (that.character.x < value.x + value.width &&
                       that.character.x + that.character.width > value.x &&
                       that.character.y < value.y + value.height &&
                       that.character.height + that.character.y > value.y)
                    {
                        that.collision();
                    }
                });

                // remove obstacles
                this.obstacles = $.grep(this.obstacles, function(value)
                {
                    return value.y < that.height;
                });
            }
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
                .fillRect(this.character.x, this.character.y, this.character.width, this.character.height);

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
                .wrappedText("Time:  " + Math.floor(this.time).toString() + "s", 5, 16)
                .wrappedText("Score: " + Math.floor(this.score).toString(), 5, 40);

            // obstacles
            $.each(this.obstacles, function(index, value)
            {
                that.layer
                    .fillStyle("#000000")
                    .fillRect(value.x, value.y, value.width, value.height);
            });
        },

        collision: function()
        {
            this.running = false;

            var name = prompt("Please enter your name:", "Unknown");
            if (name != null)
            {
                that.leaderboard_post(name, Math.floor(this.score));
            }
        }
    });
};