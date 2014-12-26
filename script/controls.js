Game.prototype.controls_enter = function()
{
    console.log("enter");
};

Game.prototype.controls_left = function()
{
    console.log("left");
};

Game.prototype.controls_top = function()
{
    console.log("top");
};

Game.prototype.controls_right = function()
{
    console.log("right");
};

Game.prototype.controls_down = function()
{
    console.log("down");
};

Game.prototype.controls_init = function()
{
    var that = this;
    $(document).keydown(function(event)
    {
        switch(event.keyCode)
        {
            case 13:
            case 32:
                that.controls_enter();
                break;
            case 37:
                that.controls_left();
                break;
            case 38:
                that.controls_top();
                break;
            case 39:
                that.controls_right();
                break;
            case 40:
                that.controls_down();
                break;
        }
    });
};