DodgeIt.prototype.gameplay = function()
{
    var that = this;
    var game = new Playground({
        // container
        container: $("div#gameplay", this.container).get(0),

        // size
        width:  this.container.width(),
        height: this.container.height(),

        // game screen properties
        sidebar: {
            width:  Math.floor(this.container.width() / 3.5),
            border: 2,
            bordercolor: "#000000"
        },

        // background
        background: {
            x: 0,       // this.sidebar.width    
            y: 0,

            img: null,  // set at start
            src: "",    // set at start
            width:  0,  // calculated on start
            height: 0   // calculated on start
        },

        // character
        character: {
            maxwidth:  48,
            maxheight: 48,
            x: 0,
            y: 0, // calculated on start
            speed: 300,

            img: null,  // set at start
            src: "",    // set at start
            width:  32, // calculated on start
            height: 32, // calculated on start
        },

        // obstacles
        obstacle: {
            items: [
                {
                    img: null,          // set at start
                    src: "",            // set at start
                    src_suffix: "-1x1",
                    height: 50,
                    width:  50
                },
                {
                    img: null,          // set at start
                    src: "",            // set at start
                    src_suffix: "-1x2",
                    height: 100,
                    width:  50
                },
                {
                    img: null,          // set at start
                    src: "",            // set at start
                    src_suffix: "-2x1",
                    height: 50,
                    width:  100,
                }
            ],

            speed: 100,
            speed_time: 10,     // every x seconds the speed changes
            speed_factor: 1.15  // speed change per step
        },
        obstacles: [],

        // game states
        states: {
            create:     0,
            countdown:  1,
            running:    2,
            pause:      3,
            gameover:   4
        },
        state: 0,

        // time
        time: 0,

        // score
        score: 0,
        points: {
            time: 10,
            obstacle: 0.005 // points per pixel
        },

        create: function()
        {
            // background image           
            this.background.src = that.options.style + "/background";
            this.loadImages(this.background.src + ".jpg");

            // character image
            this.character.src = that.options.style + "/character";
            this.loadImages(this.character.src);

            // obstacles
            var that2 = this;
            $.each(this.obstacle.items, function(index, value)
            {
                that2.loadImages(that.options.style + "/obstacle" + value.src_suffix);
                value.src = that.options.style + "/obstacle" + value.src_suffix;
            });

            // start
            this.start();
        },

        start: function()
        {
            this.state = this.states.create;
        },

        step: function(delta)
        {
            var that2 = this;

            // INIT  
            if (this.state == this.states.create)
            {
                // remove obstacles
                this.obstacles = [];

                // set time
                this.time = -3;

                // set score
                this.score = 0;

                // start game
                this.state = this.states.countdown;
                
                // background image
                if (this.background.img == null)
                {
                    this.background.x = this.sidebar.width; 

                    this.background.img = this.images[this.background.src];

                    var scale = (this.width - this.sidebar.width) / this.background.img.naturalWidth;
                    this.background.width  = Math.round(this.background.img.naturalWidth * scale);
                    this.background.height = Math.round(this.background.img.naturalHeight * scale);
                }

                // character image
                if (this.character.img == null)
                {
                    this.character.y = this.height - this.character.height;

                    this.character.img = this.images[this.character.src];

                    var scaleWidth = this.character.maxwidth / this.character.img.naturalWidth;
                    var scaleHeight = this.character.maxheight / this.character.img.naturalHeight;
                    var scale = Math.min(scaleWidth, scaleHeight);
                    
                    this.character.width = Math.round(this.character.img.naturalWidth * scale);
                    this.character.height = Math.round(this.character.img.naturalHeight * scale);
                    this.character.y = this.height - this.character.height;                
                }

                // set character position
                this.character.x = (this.width + this.sidebar.width - this.character.width) / 2;

                // obstacles
                $.each(this.obstacle.items, function(index, value)
                {
                    value.img = that2.images[value.src];
                });
            }      

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
                this.background.y = (this.background.y + (this.obstacle.speed * delta * that2.getSpeedFactor())) % this.background.height;

                // move character
                var control_speed = 0;
                if (that.controls.command["left"].pressed && !that.controls.command["right"].pressed)
                {
                    control_speed = -1;
                }
                else if (!that.controls.command["left"].pressed && that.controls.command["right"].pressed)
                {
                    control_speed = 1;
                }
                else if (this.gamepads[0])
                {
                    // DPAD
                    if (this.gamepads[0].buttons)
                    {
                        if (this.gamepads[0].buttons["left"])
                        {
                            control_speed = -1;
                        }
                        else if(this.gamepads[0].buttons["right"])
                        {
                            control_speed = 1;
                        }                        
                    }

                    // Stick 1
                    var i = 0;
                    while (control_speed == 0 &&
                           this.gamepads[0].sticks[i])
                    {
                        if (Math.abs(this.gamepads[0].sticks[i]) > 0.1)
                        {
                            control_speed = Math.ceil(this.gamepads[0].sticks[i].x) * 
                                            (Math.abs(this.gamepads[0].sticks[i].x) - 0.1) / 0.9;
                        }                        

                        // inc i
                        i++;
                    }
                }

                this.character.x += control_speed * this.character.speed * delta;

                // check new position
                this.character.x = Math.max(this.character.x, this.sidebar.width);
                this.character.x = Math.min(this.character.x, this.width - this.character.width);

                // create obstacle
                if (this.obstacles.length == 0 ||
                    this.time - this.obstacles[this.obstacles.length - 1].spawntime >= 1.5) // spawn every 1.5 seconds
                {
                    var obstacle_id = Math.floor(Math.random() * this.obstacle.items.length);
                    var obstacle_x = Math.floor(Math.random() * (this.width - this.sidebar.width - this.obstacle.items[obstacle_id].width)) + this.sidebar.width;

                    this.obstacles.push({
                        img: this.obstacle.items[obstacle_id].img,
                        x: obstacle_x,
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
                    value.y += delta * that2.obstacle.speed * that2.getSpeedFactor();

                    // collision test
                    if (that2.character.x < value.x + value.width &&
                       that2.character.x + that2.character.width > value.x &&
                       that2.character.y < value.y + value.height &&
                       that2.character.height + that2.character.y > value.y)
                    {
                        that2.collision();
                    }
                });

                // remove obstacles
                this.obstacles = $.grep(this.obstacles, function(value)
                {
                    var remove = value.y >= that2.height;
                    if (remove)
                    {
                        that2.score += that2.points.obstacle * (value.width * value.height);
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
            this.layer.drawImage(this.character.img,
                                 this.character.x,
                                 this.character.y,
                                 this.character.width,
                                 this.character.height);

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
                that.layer.drawImage(value.img,
                                     value.x,
                                     value.y,
                                     value.width,
                                     value.height);
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
                this.end();
            }
        },

        gamepaddown: function(event)
        {
            if (event.button == "start")
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
        },

        getSpeedFactor: function()
        {
            return Math.pow(this.obstacle.speed_factor, Math.floor(this.time / this.obstacle.speed_time));
        },

        end: function()
        {
            $(this.container).html("");
            that.screen_show("menu");
        }
    });

    this.controls.command["back"].fn = function()
    {
        if (game.state == game.states.running)
        {
            game.state = game.states.pause;
        }
        else if (game.state == game.states.pause)
        {
            game.state = game.states.running;
        }
    };
};