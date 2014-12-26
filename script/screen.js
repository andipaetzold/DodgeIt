Game.prototype.screen_about = function()
{
    this.container.html("");

    var that = this;

    this.container
        .append($("<span></span>")
            .html("Back")
            .click(function()
            {
                that.menu_show();
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