DodgeIt.prototype.gameplay_start = function(container)
{
    var game = playground({
        width: this.container.width(),
        height: this.container.height(),

        container: container.get(0),

        step: function(delta)
        {
        },

        render: function()
        {
            this.layer.clear("#FFFFFF")
        }
    });
};