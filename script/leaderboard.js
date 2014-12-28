Game.prototype.leaderboard_post = function(name, score)
{
    var url = "https://docs.google.com/forms/d/1O4OfBssi1MZZd1v7gfo_bsyU_r52IVSN8GEYH1I2Luo/formResponse";
    $.post(url, {
        "entry.1065023134": name,
        "entry.1650551768": score
    });
};

Game.prototype.leaderboard_get = function(start, count)
{
    // sample data (sorted) from spreadsheet
    var data = [
        {name: "Player 1", score: 13},
        {name: "Player 2", score: 12},
        {name: "Player 3", score: 11},
        {name: "Player 4", score: 10},
        {name: "Player 5", score: 9},
        {name: "Player 6", score: 8},
        {name: "Player 7", score: 7},
        {name: "Player 8", score: 6},
        {name: "Player 9", score: 5},
        {name: "Player 10", score: 4},
        {name: "Player 11", score: 3},
        {name: "Player 12", score: 2},
        {name: "Player 13", score: 1}
    ];

    // filter items
    var output = [];
    for (var i = start; (i <= data.length - 1) && (i - start <= count - 1); i++) {
        output.push(data[i]);
    };

    return output;
};