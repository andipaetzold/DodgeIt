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
    var items = [
        {
            title: "Start Game",
            click: function() { g.screen_game(); }
        },
        {
            title: "Leaderboard",
            click: function() { g.screen_leaderboard(); }
        },
        {
            title: "Controls",
            click: function() { g.screen_controls(); }
        },
        {
            title: "Options",
            click: function() { g.screen_options(); }
        },
        {
            title: "About",
            click: function() { g.screen_about(); }
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
    console.log("game");
}

Game.prototype.screen_leaderboard = function()
{
    console.log("leaderboard");
}

Game.prototype.screen_controls = function()
{
    console.log("controls");   
}

Game.prototype.screen_options = function()
{
    console.log("options");
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