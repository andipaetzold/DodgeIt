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
            console.log("About");
        } 
    },
];

Game.prototype.menu_show = function()
{
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
            );
    });
};