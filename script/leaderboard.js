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
    // get data
    var table_key = "1bWUyCx4cLJn6EXe_0Y8NxJ3iJhjqMM5pHfSCEuVD8Ec";
    var query = "select+B,+C+order+by+C+desc";
    var url = "https://docs.google.com/spreadsheets/d/"+table_key+"/gviz/tq?tq="+query+"&tqx=responseHandler:done";
    var responseText = $.ajax({
        type: "GET",
        url: url,
        async: false
    }).responseText;
    var text_begin = "done(";
    var text_end   = ");";
    responseText = responseText.substr(text_begin.length, responseText.length - text_begin.length - text_end.length);
    responseText = $.parseJSON(responseText);

    var data = [];
    $.each(responseText.table.rows, function(index, value)
    {
        data.push({
            name:   value.c[0].v,
            score:  value.c[1].v
        });
    });

    // filter items
    var output = [];
    for (var i = start; (i <= data.length - 1) && (i - start <= count - 1); i++) {
        output.push(data[i]);
    };

    return output;
};