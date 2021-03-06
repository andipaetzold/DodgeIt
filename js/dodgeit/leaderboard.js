var Leaderboard = {
    post: function(name, score)
    {
        var url = "https://docs.google.com/forms/d/1O4OfBssi1MZZd1v7gfo_bsyU_r52IVSN8GEYH1I2Luo/formResponse";
        $.post(url, {
            "entry.1065023134": name,
            "entry.1650551768": score
        });
    },

    get: function(fn)
    {
        var that = this;

        // get data
        var table_key = "1bWUyCx4cLJn6EXe_0Y8NxJ3iJhjqMM5pHfSCEuVD8Ec";
        $.ajax({
            url: "https://docs.google.com/spreadsheets/d/"+table_key+"/gviz/tq?",

            dataType: "jsonp",
            type: "GET",
            cache: false,

            data: {
                tq:     "select B, C order by C desc",
                tqx:    "responseHandler:success"
            },

            success: function(responseText)
            {
                var data = [];
                $.each(responseText.table.rows, function(index, value)
                {
                    data.push({
                        name:   value.c[0].v,
                        score:  value.c[1].v
                    });
                });

                fn(data);
            },

            jsonpCallback: "success"
        });
    }
};