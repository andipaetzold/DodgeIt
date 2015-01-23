DodgeIt.prototype.gameplay = function()
{
    var that = this;
    var game = new Playground({
        // container
        container: $("div#gameplay", this.container).get(0),

        // size
        width:  160 * 3,
        height: 144 * 3,

        // background
        background: {
            x: 0,  
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
                    spawnprobability: 5,
                    create: function(game)
                    {
                        return {
                            img:    this.img,
                            x:      Math.round(Math.randomRange(0, game.width - 50)),
                            y:      -50,
                            width:  50,
                            height: 50,
                            spawntime: game.time,
                            game: game,
                            calc: function(delta) { this.y += delta * game.obstacle.speed * game.getSpeedFactor(); }
                        }
                    }
                },
                {
                    img: null,          // set at start
                    src: "",            // set at start
                    src_suffix: "-1x2",
                    spawnprobability: 4,
                    create: function(game)
                    {
                        return {
                            img:    this.img,
                            x:      Math.round(Math.randomRange(0, game.width - 50)),
                            y:      -100,
                            width:  50,
                            height: 100,
                            spawntime: game.time,
                            game: game,
                            calc: function(delta) { this.y += delta * game.obstacle.speed * game.getSpeedFactor(); }
                        };
                    }
                },
                {
                    img: null,          // set at start
                    src: "",            // set at start
                    src_suffix: "-2x1",
                    spawnprobability: 4,
                    create: function(game)
                    {
                        return {
                            img:    this.img,
                            x:      Math.round(Math.randomRange(0, game.width - 100)),
                            y:      -50,
                            width:  100,
                            height: 50,
                            spawntime: game.time,
                            game: game,
                            calc: function(delta) { this.y += delta * game.obstacle.speed * game.getSpeedFactor(); }
                        };
                    }
                },
                {   // moves with 2x speed
                    img: null,          // set at start
                    src: "",            // set at start
                    src_suffix: "-1x1",
                    spawnprobability: 2,
                    create: function(game)
                    {
                        return {
                            img:    this.img,
                            x:      Math.round(Math.randomRange(0, game.width - 50)),
                            y:      -50,
                            width:  50,
                            height: 50,
                            spawntime: game.time,
                            game: game,
                            calc: function(delta) { this.y += delta * game.obstacle.speed * game.getSpeedFactor() * 2; }
                        };
                    }
                },
                {   // moves left and right by 150px
                    img: null,          // set at start
                    src: "",            // set at start
                    src_suffix: "-1x1",
                    spawnprobability: 1,
                    create: function(game)
                    {
                        var range = 150;
                        var x = Math.round(Math.randomRange(range / 2, game.width - 50 - (range / 2)));
                        return {
                            img:    this.img,
                            x:      x, // current position
                            x_org:  x, // center of the sinus function
                            y:      -50,
                            width:  50,
                            height: 50,
                            spawntime: game.time,
                            game: game,
                            calc: function(delta)
                            {
                                this.x  = this.x_org + Math.sin((this.spawntime - game.time) * 4) * range / 2;
                                this.y += delta * game.obstacle.speed * game.getSpeedFactor();
                            }
                        };
                    }
                }
            ],

            next: {
                time: 0,
                min:  0.5,   // min time difference
                max:  2.5,   // max time difference
                calc: function(time)
                {
                    this.time = time + Math.randomRange(this.min, this.max);
                }
            },

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

            // reset next-obstacle time
            this.obstacle.next.calc(0);

            // start
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
                    this.background.img = this.images[this.background.src];

                    var scale = this.width / this.background.img.naturalWidth;
                    this.background.width  = Math.round(this.background.img.naturalWidth * scale);
                    this.background.height = Math.round(this.background.img.naturalHeight * scale);
                }

                // character image
                if (this.character.img == null)
                {
                    this.character.img = this.images[this.character.src];

                    var scaleWidth = this.character.maxwidth / this.character.img.naturalWidth;
                    var scaleHeight = this.character.maxheight / this.character.img.naturalHeight;
                    var scale = Math.min(scaleWidth, scaleHeight);
                    
                    this.character.width = Math.round(this.character.img.naturalWidth * scale);
                    this.character.height = Math.round(this.character.img.naturalHeight * scale);

                    this.character.x = (this.width - this.character.width) / 2;
                    this.character.y = this.height - this.character.height;                
                }

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
                that.controls_gamepad_poll(false);

                var control_speed_x = 0;
                var control_speed_y = 0;

                // move character - gamepad
                control_speed_x = that.controls_axes().x;
                control_speed_y = that.controls_axes().y;

                // move character - left/right
                if (control_speed_x == 0)
                {
                    if (that.controls.command["left"].pressed && !that.controls.command["right"].pressed)
                    {
                        control_speed_x = -1;
                    }
                    else if (!that.controls.command["left"].pressed && that.controls.command["right"].pressed)
                    {
                        control_speed_x = 1;
                    }
                }

                // move character - up/down
                if (control_speed_y == 0)
                {
                    if (that.controls.command["up"].pressed && !that.controls.command["down"].pressed)
                    {
                        control_speed_y = -1;
                    }
                    else if (!that.controls.command["up"].pressed && that.controls.command["down"].pressed)
                    {
                        control_speed_y = 1;
                    }
                }

                // check new position
                this.character.x += control_speed_x * that.options.speed * delta;
                this.character.x = Math.max(this.character.x, 0);
                this.character.x = Math.min(this.character.x, this.width - this.character.width);

                this.character.y += control_speed_y * that.options.speed * delta;
                this.character.y = Math.max(this.character.y, 0);
                this.character.y = Math.min(this.character.y, this.height - this.character.height);

                // create obstacle
                if (this.time >= this.obstacle.next.time)
                {
                    var spawnprobabilities = this.obstacle.items.reduce(function(pv, cv) 
                    {
                        pv.push(cv.spawnprobability);
                        return pv;
                    }, []);

                    var obstacle_id = Math.randomWeighted(spawnprobabilities);
                    this.obstacles.push(this.obstacle.items[obstacle_id].create(this));

                    // calc next spawn time
                    this.obstacle.next.calc(this.time);
                }

                // move obstacles / collision test
                $.each(this.obstacles, function(index, obstacle)
                {
                    // move
                    obstacle.calc(delta);

                    // collision test
                    if (that2.character.x < obstacle.x + obstacle.width &&
                       that2.character.x + that2.character.width > obstacle.x &&
                       that2.character.y < obstacle.y + obstacle.height &&
                       that2.character.height + that2.character.y > obstacle.y)
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

            // obstacles
            $.each(this.obstacles, function(index, value)
            {
                that.layer.drawImage(value.img,
                                     value.x,
                                     value.y,
                                     value.width,
                                     value.height);
            });

            // text
            this.layer
                .fillStyle("#FFFFFF")
                .font("16px Arial")
                .wrappedText("Time:  " + Math.floor(this.time).toString() + "s", 5, 16)
                .wrappedText("Score: " + Math.floor(this.score).toString(), 5, 40);

            // countdown
            if (this.state == this.states.countdown)
            {
                this.layer
                    .font("200px Arial");

                var text = Math.abs(Math.floor(this.time)).toString();
                textboundaries = this.layer.textBoundaries(text);

                this.layer
                    .fillStyle("#FFFFFF")
                    .wrappedText(text, (this.width - textboundaries.width) / 2, (this.height + textboundaries.height) / 2);
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
                    .wrappedText(text, (this.width - textboundaries.width) / 2, (this.height + textboundaries.height) / 2);
            }
        },

        collision: function()
        {
            this.state = this.states.gameover;
            $(this.container).html("");

            // leaderboard post
            $("div#gameplay-gameover span.score", that.container).html(Math.floor(this.score));
            that.screen_show("gameplay-gameover");
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