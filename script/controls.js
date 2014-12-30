Game.prototype.controls_init = function()
{
    var that = this;
    $(document).keydown(function(event)
    {
        switch(event.keyCode)
        {
            case 8:
                that.controls_back();
                break;
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
            default:
                return true;
        }

        return false;
    });
};

Game.prototype.controls_reset = function()
{
    Game.prototype.controls_back    = function() {};
    Game.prototype.controls_enter   = function() {};
    Game.prototype.controls_left    = function() {};
    Game.prototype.controls_top     = function() {};
    Game.prototype.controls_right   = function() {};
    Game.prototype.controls_down    = function() {};
}