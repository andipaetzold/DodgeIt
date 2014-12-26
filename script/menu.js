Game.prototype.menu_items = [
    {
        title: "Start Game",
        click: function()
        { 
            console.log("Start Game");
        } 
    },
    {
        title: "Leaderboard",
        click: function()
        { 
            console.log("Leaderboard");
        } 
    },
    {
        title: "Controls",
        click: function()
        { 
            console.log("Controls");
        } 
    },
    {
        title: "Options",
        click: function()
        { 
            console.log("Options");
        } 
    },
    {
        title: "About",
        click: function()
        {
            g.screen_about();
        } 
    }
];

Game.prototype.menu_show = function()
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

    // build menu
    var container = this.container;
    container.html("");
    var menu = $("<div></div>")
               .addClass("menu")
               .appendTo(container);

    // add items
    $.each(this.menu_items, function(index, value)
    {
        menu
        .append(
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
};