DodgeIt.prototype.gameplay_start = function(container)
{
    var game = playground({
        width: this.container.width(),
        height: this.container.height(),

        container: container.get(0),

        step: function(delta)
        {
            // move character
            if (this.keyboard.keys.left && !this.keyboard.keys.right)
            {
                this.character.x -= 300 * delta;
            }
            else if (!this.keyboard.keys.left && this.keyboard.keys.right)
            {
                this.character.x += 300 * delta;
            }

            // check new position
            this.character.x = Math.max(this.character.x, 0);
            this.character.x = Math.min(this.character.x, this.width - this.character.width);

            // inc time
            this.time += delta;
        },

        render: function()
        {
            this.layer.clear("#FFFFFF");

            // character
            this.layer
                .fillStyle("#000")
                .fillRect(this.character.x, this.height - this.character.height, this.character.width, this.character.height);

            // text
            this.layer
                .font("16px Arial")
                .wrappedText(Math.round(this.time).toString() + "s", 5, 16);
        },

        // character
        character: {
            width:  64,
            height: 64,
            x: 0
        },

        // time
        time: 0
    });
};