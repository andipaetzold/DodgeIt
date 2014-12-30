Game.prototype.screen_menu = function()
{
    // set controls
    this.controls_reset();
    Game.prototype.controls_enter = function()
    {
        $("#game div.menu span.selected").click();
    };
    Game.prototype.controls_top = function()
    {
        var selected = $("#game div.menu span.selected");
        selected.removeClass("selected");
        if (selected.prevAll().length > 0)
        {
            selected.prev().addClass("selected");
        }
        else
        {
            selected.parent().children().last().addClass("selected");   
        }
    };
    Game.prototype.controls_down = function()
    {
        var selected = $("#game div.menu span.selected");
        selected.removeClass("selected");
        if (selected.nextAll().length > 0)
        {
            selected.next().addClass("selected");
        }
        else
        {
            selected.parent().children().first().addClass("selected");   
        }
    };

    // menu-items
    var that = this;
    var items = [
        {
            title: "Start Game",
            click: function() { that.screen_game(); }
        },
        {
            title: "Leaderboard",
            click: function() { that.screen_leaderboard(); }
        },
        {
            title: "Controls",
            click: function() { that.screen_controls(); }
        },
        {
            title: "Options",
            click: function() { that.screen_options(); }
        },
        {
            title: "About",
            click: function() { that.screen_about(); }
        }
    ];

    // build menu
    this.container.html("");
    var menu = $("<div></div>")
               .addClass("menu")
               .appendTo(this.container);

    // add items
    $.each(items, function(index, value)
    {
        menu.append(
            $("<span></span>")
                .html(value.title)
                .click(value.click)
                .mouseenter(function()
                {
                    menu.children().removeClass("selected");
                    $(this).addClass("selected");
                })
        );
    });
    menu.children().first().addClass("selected");
}

Game.prototype.screen_game = function()
{
}

Game.prototype.screen_leaderboard = function()
{
    this.container.html("");

    var that = this;
    this.container
        .append($("<span></span>")
            .html("Back")
            .click(function()
            {
                that.screen_menu();
            })
        )
        .append($("<h1></h1>").html("Leaderboard"));

    var table = $("<table></table>").appendTo(this.container);
    var data = this.leaderboard_get(0, 10);
    $.each(data, function(index, item)
    {
        $("<tr></tr>")
            .appendTo(table)
            .append($("<td></td>").html(item.name))
            .append($("<td></td>").html(item.score));
    });
}

Game.prototype.screen_controls = function()
{
    this.container.html("");

    var that = this;
    this.container
        .append($("<span></span>")
            .html("Back")
            .click(function()
            {
                that.screen_menu();
            })
        )
        .append($("<h1></h1>").html("Controls"));
}

Game.prototype.screen_options = function()
{
    this.container.html("");

    var that = this;
    this.container
        .append($("<span></span>")
            .html("Back")
            .click(function()
            {
                that.screen_menu();
            })
        )
        .append($("<h1></h1>").html("Options"))
        .append($("<h2></h2>").html("Music"))
        .append($("<input>")
            .attr("type", "range")
            .attr("min", "0")
            .attr("max", this.audio.music.max)
            .attr("value", this.audio.music.volume_get())
            .on("change mousemove", function()
            {
                that.audio.music.volume_change($(this).val());
            })
        )
        .append($("<h2></h2>").html("Sound Effects"))
        .append($("<input>")
            .attr("type", "range")
            .attr("min", "0")
            .attr("max", this.audio.sfx.max)
            .attr("value", this.audio.sfx.volume_get())
            .on("change mousemove", function()
            {
                that.audio.sfx.volume_change($(this).val());
            }));
}

Game.prototype.screen_about = function()
{
    this.container.html("");

    var that = this;
    this.container
        .append($("<span></span>")
            .html("Back")
            .click(function()
            {
                that.screen_menu();
            })
        )
        .append($("<h1></h1>").html("About"))
        .append($("<p></p>").html("Insert the about-text here.."))
        .append(
            $("<span></span>")
            .html("&copy;2015 Andreas P&auml;tzold")
        )
        .append($("<br>"))
        .append(
            $("<a></a>")
            .attr("href", "mailto:andi.paetzold@gmail.com")
            .html("andi.paetzold@gmail.com")
        )
        .append($("<br>"))
        .append(
            $("<a></a>")
            .attr("href", "https://github.com/andipaetzold/DodgeIt")
            .attr("target", "_blank")
            .html("GitHub")
        ); 
}