DodgeIt.prototype.gameplay_start = function(container)
{
    container.html("");
    
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
            width:  32,
            height: 32,
            x: 0,
            y: 0, // calculated on start
            speed: 300
        },

        // obstacles
        obstacle: {
            items: [
                {
                    height: 50,
                    width:  50
                },
                {
                    height: 100,
                    width:  50
                },
                {
                    height: 50,
                    width:  100
                }
            ],

            speed: 100
        },
        obstacles: [],

        // game states
        states: {
            countdown:  0,
            running:    1,
            pause:      2,
            gameover:   3
        },
        state: 0,

        // time
        time: 0,

        // score
        score: 0,
        points: {
            time: 10,
            obstacle: 10
        },

        // prevent keyboard default
        preventKeyboardDefault: true,

        create: function()
        {
            // calc character y
            this.character.y = this.height - this.character.height;

            // background-image
            this.loadImages("road.jpg");
            var  scale = (this.width - this.sidebar.width) / this.images.road.naturalWidth;
            this.background = {
                img: this.images.road,
                x: this.sidebar.width,
                y: 0,
                width:  Math.round(this.images.road.naturalWidth * scale),
                height: Math.round(this.images.road.naturalHeight * scale)
            };

            // start
            this.start();
        },

        start: function()
        {
            // set character position
            this.character.x = this.sidebar.width;

            // remove obstacles
            this.obstacles = [];

            // set time
            this.time = -3;

            // set score
            this.score = 0;

            // start game
            this.state = this.states.countdown;
        },

        step: function(delta)
        {
            var that = this;

            // inc time
            if (this.state == this.states.countdown ||
                this.state == this.states.running)
            {
                this.time += delta;
            }

            if (this.state == this.states.countdown)
            {
                if (this.time >= 0)
                {
                    this.state = this.states.running;
                }
            }
            else if (this.state == this.states.running)
            {
                // inc score
                this.score += delta * this.points.time;

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
                    var obstacle_id = Math.floor(Math.random() * this.obstacle.items.length);

                    this.obstacles.push({
                        x: Math.floor(Math.random() * (this.width - this.sidebar.width - this.obstacle.items[obstacle_id].width)) + this.sidebar.width,
                        y: -this.obstacle.items[obstacle_id].height,
                        width: this.obstacle.items[obstacle_id].width,
                        height: this.obstacle.items[obstacle_id].height,
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
                    var remove = value.y >= that.height;
                    if (remove)
                    {
                        that.score += that.points.obstacle;
                    }
                    return !remove;
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

            // countdown
            if (this.state == this.states.countdown)
            {
                this.layer
                    .font("200px Arial");

                var text = Math.abs(Math.floor(this.time)).toString();
                textboundaries = this.layer.textBoundaries(text);

                this.layer
                    .fillStyle("#FFFFFF")
                    .wrappedText(text, this.sidebar.width + (this.width - this.sidebar.width - textboundaries.width) / 2, (this.height + textboundaries.height) / 2);
            }

            // pause
            if (this.state == this.states.pause)
            {
                this.layer
                    .font("100px Arial");

                var text = "Pause";
                textboundaries = this.layer.textBoundaries(text);

                this.layer
                    .fillStyle("#FFFFFF")
                    .wrappedText(text, this.sidebar.width + (this.width - this.sidebar.width - textboundaries.width) / 2, (this.height + textboundaries.height) / 2);
            }
        },

        collision: function()
        {
            this.state = this.states.gameover;

            // leaderboard
            var name = prompt("Please enter your name:", "Unknown");
            if (name != null)
            {
                that.leaderboard.post(name, Math.floor(this.score));
            }

            // restart
            if (confirm("Restart?"))
            {
                this.start();
            }
            else
            {
                that.screen_show("menu");
            }
        },

        keydown: function(event)
        {
            if(event.key == "escape")
            {
                if (this.state == this.states.running)
                {
                    this.state = this.states.pause;
                }
                else if (this.state == this.states.pause)
                {
                    this.state = this.states.running;
                }
            }
        }
    });
};