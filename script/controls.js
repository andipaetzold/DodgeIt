DodgeIt.prototype.controls_init = function()
{
    var that = this;
    $(document).keydown(function(event)
    {
        switch(event.keyCode)
        {
            case  8: // Backspace
                that.controls_back();
                break;
            case 13: // Enter
            case 32: // Space
                that.controls_enter();
                break;
            case 37: // Arrow Left
                that.controls_left();
                break;
            case 38: // Arrow Top
                that.controls_top();
                break;
            case 39: // Arrow Right
                that.controls_right();
                break;
            case 40: // Arrow Down
                that.controls_down();
                break;
            default:
                return true;
        }

        return false;
    });
};

DodgeIt.prototype.controls_reset = function()
{
    DodgeIt.prototype.controls_back    = function() {};
    DodgeIt.prototype.controls_enter   = function() {};
    DodgeIt.prototype.controls_left    = function() {};
    DodgeIt.prototype.controls_top     = function() {};
    DodgeIt.prototype.controls_right   = function() {};
    DodgeIt.prototype.controls_down    = function() {};
}