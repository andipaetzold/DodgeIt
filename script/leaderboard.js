Game.prototype.leaderboard_post = function(name, score)
{
    var url = "https://docs.google.com/forms/d/1O4OfBssi1MZZd1v7gfo_bsyU_r52IVSN8GEYH1I2Luo/formResponse";
    $.post(url, {
        "entry.1065023134": name,
        "entry.1650551768": score
    });
};