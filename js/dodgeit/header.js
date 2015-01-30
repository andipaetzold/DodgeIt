// window.requestAnimationFrame         
if (!window.requestAnimationFrame)
{
    window.requestAnimationFrame = (function()
    {
        return window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function(callback, element)
               {
                  window.setTimeout(callback, 1000 / 60);
               };
    })();
} 

// random range
Math.randomRange = function(min, max)
{
    return Math.random() * (max - min) + min;
};

// weighted random
Math.randomWeighted = function(data)
{
    var total = data.reduce(function(pv, cv) { return pv + cv; }, 0);

    var rand = Math.randomRange(0, total);
    var cur = 0;
    for (var i = 0; i <= data.length - 1; i++)
    {
        cur += data[i];
        if (rand < cur)
        {
            return i;
        }
    }
};