var Leaderboard = {
    post: function(name, score)
    {
        var url = "https://docs.google.com/forms/d/1O4OfBssi1MZZd1v7gfo_bsyU_r52IVSN8GEYH1I2Luo/formResponse";
        $.post(url, {
            "entry.1065023134": name,
            "entry.1650551768": score
        });
    },

    get: function(start, count, table)
    {
        var that = this;

        // loading
        table
            .empty()
            .append(
                $("<tr></tr>")
                    .addClass("loading")
                    .append(
                        $("<td></td>")
                            .attr("colspan", 3)
                            .html("Loading...")
                    )
                );

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

                // clear table
                table.empty();

                // filter items
                var output = [];
                for (var i = start; i - start <= count - 1; i++)
                {
                    if (i <= data.length - 1)
                    {
                        $("<tr></tr>")
                            .appendTo(table)
                            .append($("<td></td>").html(i + 1))
                            .append($("<td></td>").html(data[i].name))
                            .append($("<td></td>").html(data[i].score));                        
                    }
                    else
                    {
                        // add empty row
                        $("<tr></tr>")
                            .appendTo(table)
                            .append("<td>&nbsp;</td>")
                            .append("<td>&nbsp;</td>")
                            .append("<td>&nbsp;</td>");
                    }

                };

                // add buttons
                var tr_button = $("<tr></tr>").appendTo(table).addClass("buttons");
                var td_1 = $("<td></td>").attr("colspan", 2).appendTo(tr_button);
                var td_2 = $("<td></td>").appendTo(tr_button);

                // prev
                if (start != 0)
                {
                    td_1.append(
                        $("<button></button>")
                            .html("previous " + count)
                            .click(function()
                            {
                                that.get(start - count, count, table);
                            })
                    );
                }

                // next
                if (data.length >= start + count)
                {
                    td_2.append(
                        $("<button></button>")
                            .html("next " + count)
                            .click(function()
                            {
                                that.get(start + count, count, table);
                            })
                    );
                }
            },

            jsonpCallback: "success"
        });
    }
};