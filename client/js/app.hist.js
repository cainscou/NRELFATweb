d3.csv("data_out_filtered.csv", function(error, allRawData) {

  // Various formatters.
  var formatInt = d3.format(",d"),
      formatDecimal = d3.format(",.2f"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");

  // A nest operator, for grouping the data point list.
  var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.date); });

  // A little coercion, since the CSV is untyped. Converts JavaScript data types.
  allRawData.forEach(function(d, i) {
    d.index = i;
    d.date = parseDate(d.date);
    d.fill_time_min = +d.fill_time_min;
    d.fill_amount_kg = +d.fill_amount_kg;
    d.fill_rate = +d.fill_rate;
    d.final_fill_temp = +d.final_fill_temp;
    d.final_fill_press = +d.final_fill_press;

  });

  // Define chart formatting options for each graph:
  // Chart 1
  var chart1_DomainMin = new Date(2010, 0, 1),
      chart1_DomainMax = new Date(2014, 1, 1),
      chart1_numOfBins = (4*12 + 1);

  // Chart 2
  var max_hour = 24;

  var chart2_DomainMin = 0,
      chart2_DomainMax = max_hour+1,
      chart2_numOfBins = (chart2_DomainMax - chart2_DomainMin);

  // Chart 3
  var chart3_DomainMin = 0,
      chart3_DomainMax = 25,
      chart3_binSize = 1,
      chart3_numOfBins = (chart3_DomainMax - chart3_DomainMin)/ chart3_binSize;

  // Chart 4
  var chart4_DomainMin = 0,
      chart4_DomainMax = 5,
      chart4_binSize = 0.1,
      chart4_numOfBins = (chart4_DomainMax - chart4_DomainMin) / chart4_binSize;

  // Chart 5
  var chart5_DomainMin = 0,
      chart5_DomainMax = 12,
      chart5_binSize = 0.2,
      chart5_numOfBins = (chart5_DomainMax - chart5_DomainMin)/chart5_binSize;

  // Chart 6
  var chart6_DomainMin = -20,
      chart6_DomainMax = 60,
      chart6_binSize = 1.25,
      chart6_numOfBins = (chart6_DomainMax - chart6_DomainMin)/chart6_binSize;

  // Chart 7
  var chart7_DomainMin = -10,
      chart7_DomainMax = 800,
      chart7_binSize = 12.5,
      chart7_numOfBins = (chart7_DomainMax - chart7_DomainMin) / chart7_binSize;




  // Create the crossfilter for the relevant dimensions and groups.
  var crossfilterData = crossfilter(allRawData),
      all = crossfilterData.groupAll(),

      // chart 1
      date = crossfilterData.dimension(function(d) { return d.date; }),
      dates = date.group(d3.time.month),

      // chart 2
      hour = crossfilterData.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
      hours = hour.group(Math.floor),

      // chart 3
      fill_time_min = crossfilterData.dimension(function(d) { return Math.min(24, d.fill_time_min); }),
      fill_time_mins = fill_time_min.group(function(d) { return Math.floor(d / chart3_binSize) * chart3_binSize; }),

      // chart 4
      fill_rate = crossfilterData.dimension(function(d) { return Math.max(0, d.fill_rate); }),
      fill_rates = fill_rate.group( function(d) { return Math.floor(d / chart4_binSize) * chart4_binSize; } ),

      // chart 5
      fill_amount_kg = crossfilterData.dimension(function(d) { return Math.max(0, d.fill_amount_kg); }),
      fill_amount_kgs = fill_amount_kg.group( function(d) { return Math.floor(d /chart5_binSize) * chart5_binSize; }),

      // chart 6
      fill_temp = crossfilterData.dimension(function(d) { return d.final_fill_temp; }),
      fill_temps = fill_temp.group( function(d) { return Math.floor(d / chart6_binSize) * chart6_binSize; } ),

      // chart 7
      fill_pressure = crossfilterData.dimension(function(d) { return d.final_fill_press; }),
      fill_pressures = fill_pressure.group( function(d) { return Math.floor(d /chart7_binSize) * chart7_binSize; } );


  // Define each barchart
  var charts = [

    // chart 1
    barChart()
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([chart1_DomainMin, chart1_DomainMax])
        .rangeRound([0, 11 * chart1_numOfBins]))
        .filter([new Date(2011, 1, 1), new Date(2013, 7, 1)]),

    // chart 2
    barChart()
        .dimension(hour)
        .group(hours)
      .x(d3.scale.linear()
        .domain([chart2_DomainMin, chart2_DomainMax])
        .rangeRound([0, 10 * chart2_numOfBins])),

    // chart 3
    barChart()
        .dimension(fill_time_min)
        .group(fill_time_mins)
      .x(d3.scale.linear()
        .domain([0, 25])
        .rangeRound([0, 10 * chart3_numOfBins])),

    // chart 4
    barChart()
        .dimension(fill_rate)
        .group(fill_rates)
      .x(d3.scale.linear()
        .domain([chart4_DomainMin, chart4_DomainMax])
        .rangeRound([0, 10 * chart4_numOfBins])),

    // chart 5
    barChart()
        .dimension(fill_amount_kg)
        .group(fill_amount_kgs)
      .x(d3.scale.linear()
        .domain([chart5_DomainMin, chart5_DomainMax])
        .rangeRound([0, 10 * chart5_numOfBins])),

    // chart 6
    barChart()
        .dimension(fill_temp)
        .group(fill_temps)
      .x(d3.scale.linear()
        .domain([chart6_DomainMin, chart6_DomainMax])
        .rangeRound([0, 10 * chart6_numOfBins])),

    // chart 7
    barChart()
        .dimension(fill_pressure)
        .group(fill_pressures)
      .x(d3.scale.linear()
        .domain([chart7_DomainMin, chart7_DomainMax])
        .rangeRound([0, 10 * chart7_numOfBins]))

  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the initial lists.
  var list = d3.selectAll(".list")
      .data([dataList]);

  // Render the total.
  d3.selectAll("#total")
      .text(formatInt(crossfilterData.size()));
  /* d3.selectAll("#total-kg")
      .text(crossfilterData.groupAll().reduceSum(function(d) { return d.fill_amount_kg; }).value() ); */

  // Render all charts, and remove message for page loading so user can interact with the page
  renderAll();
  hideLoadingIndicator(); // Allow page to be viewed once it has finished loading

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    list.each(render);
    d3.select("#active").text(formatInt(all.reduceCount().value()));
    d3.select("#kgSelected")
      .text(formatInt(Math.round(all.reduceSum(function(d) { return d.fill_amount_kg; }).value() )));
    // d3.select("#active-kg").text(formatInt(fill_amount_kgs.value()));

  }

  // Convert Excel date/time stamps to JavaScript Date
  function parseDate(d) {

    var d = new Date((Number(d) - 25569)*24*60*60*1000+500); //Add offset of 500 to get rid of floating point errors.  Without it 01:00:00 might become 00:59:59 due to cutoff error in the milliseconds, and the data event will be placed into the wrong bin.
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
        d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
        d.getUTCMilliseconds());


    /*
    // The first date created will be in GMT, but we want times to be local time.  If times are not already put into local, the users computer will offset the timestamps from GMT based on their local time zone, so time of day graphs will be inaccurate for everyone outside of GMT. However, the second method of creating a new date will put the date in local time, so we are just using it to transfer the years, months, days, hours, etc from GMT to local time.  All Excel timestamp data that is read in will be interpreted at UTC, which could be wrong, so this is a workaround.
    var d = new Date((Number(d) - 25569)*24*60*60*1000);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
        d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
        d.getUTCMilliseconds());
        */


    /*
    // FIRST ATTEMPT - Problem: getTimezoneOffet does not account for daylight savings!
    var timeOffset = new Date();
    return new Date((Number(d) - 25569)*24*60*60*1000 +timeOffset.getTimezoneOffset()*60*1000);
    //return new Date((Number(d) - 25569)*24*60*60*1000 +
    //        timeOffset.getTimezoneOffset()*60*1000);// Convert Excel Serial Date into javascript date. Number converts text string to number. getTimezoneOffet corrects the timestamp to diplay UTC as local time, so users in different time zones will see the same thing.
    */

    // SECOND FAILED ATTEMPT - Problem: for some reason when you change the text string to "Greenwich Mean Time" it still reads the date in as local time. Thought it was a clever idea but NO.
    // d = 36892.0006944444;
    // d = new Date((Number(d) - 25569)*24*60*60*1000);
    // document.getElementById("demo").innerHTML = d;
    // d = d.toString();
    // var pos1 = d.indexOf("(");
    // var pos2 = d.indexOf(")");
    // document.getElementById("demo").innerHTML += "<br>" + pos1 + "<br>" + pos2;

    // var e = d.slice(pos1 + 1, pos2);
    // document.getElementById("demo").innerHTML += "<br>" + e

    // d = d.replace(e, "Greenwich Mean Time");
    // document.getElementById("demo").innerHTML += "<br>" + d
    // d = new Date(d);
    // document.getElementById("demo").innerHTML += "<br>" + d


  }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };

  function dataList(div) {
    var rawDataByDate = nestByDate.entries(date.top(40));

    div.each(function() {
      var date = d3.select(this).selectAll(".date")
          .data(rawDataByDate, function(d) { return d.key; });

      date.enter().append("div")
          .attr("class", "date")
        .append("div")
          .attr("class", "day")
          .text(function(d) { return formatDate(d.values[0].date); });

      date.exit().remove();

      var crossfilterData = date.order().selectAll(".dataPoint")
          .data(function(d) { return d.values; }, function(d) { return d.index; });

      var dataPointEnter = crossfilterData.enter().append("div")
          .attr("class", "dataPoint");

      dataPointEnter.append("div")
          .attr("class", "time")
          .text(function(d) { return formatTime(d.date); });

      dataPointEnter.append("div")
          .attr("class", "fillamount")
          .text(function(d) { return formatDecimal(d.fill_amount_kg) + " kg"; });

      dataPointEnter.append("div")
          .attr("class", "bar")
          .text(function(d) { return formatDecimal(d.final_fill_press) + " bar"; });

      dataPointEnter.append("div")
          .attr("class", "temp")
          .text(function(d) { return formatDecimal(d.final_fill_temp) + " deg C"; });

      dataPointEnter.append("div")
          .attr("class", "filltime")
          .text(function(d) { return formatDecimal(d.fill_time_min) + " mins"; });

      dataPointEnter.append("div")
          .attr("class", "rate")
          .text(function(d) { return formatDecimal(d.fill_rate) + " kg/min"; });

      crossfilterData.exit().remove();

      crossfilterData.order();
    });
  }

  function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {
      var width = x.range()[1],  //width = 500,
          height = y.range()[0];

      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".title").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      }); // end of  div.each(function() {

      function barPath(groups) {
        var path = [],
            i = -1,

            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    } // end of chart function

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(input) {
      if (!arguments.length) return margin;
      margin = input;
      return chart;
    };

    chart.x = function(input) {
      if (!arguments.length) return x;
      x = input;
      axis.scale(x);

      /*
      if (barChart.id == 4) {
        axis.tickValues([new Date(2009, 0, 1), new Date(2009, 6, 1), new Date(2010, 0, 1), new Date(2010, 6, 1), new Date(2011, 0, 1), new Date(2011, 6, 1), new Date(2012, 0, 1), new Date(2012, 6, 1),
            new Date(2013, 0, 1), new Date(2013, 6, 1), new Date(2014, 0, 1) ]);
      }
     */

      brush.x(x);
      return chart;
    };

    chart.y = function(input) {
      if (!arguments.length) return y;
      y = input;
      return chart;
    };

    chart.dimension = function(input) {
      if (!arguments.length) return dimension;
      dimension = input;
      return chart;
    };

    chart.filter = function(input) {
      if (input) {
        brush.extent(input);
        dimension.filterRange(input);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(input) {
      if (!arguments.length) return group;
      group = input;
      return chart;
    };

    chart.round = function(input) {
      if (!arguments.length) return round;
      round = input;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  } // end of barChart() function


    // Allow page to be viewed once data has finished loading

    function hideLoadingIndicator() {
        try {
               var msDelay = 750;
               // slow down hide for certain types
               $("#chartContainerCurtainStatus").hide();
               $("#chartLoadingPage").hide();
        } catch(err) {
               console.error("ERROR: hideLoadingIndicator problem: "+err);
        }
    };



});

/*

showLoadingIndicatorMsg();

function showLoadingIndicatorMsg(msg) {
        try {
               if (msg===undefined || msg=="") {
                       msg = "Loading visualization";
               }
               $("#loaderMsg").html(msg);
               var pageHeight = $("body").css("height");
               $("#chartLoadingPage").show();
               if (pageHeight!==undefined) {
                       $("#chartLoadingPage").css("height", pageHeight);
               }
               $("#chartContainerCurtainStatus").show();
               var top = Math.round( (($(window).height() - $("#chartContainerCurtainStatus").outerHeight()) / 2), 0);
               var left = Math.round( (($(window).width() - $("#chartContainerCurtainStatus").outerWidth()) / 2), 0);
               top = ((top>0) ? top : 0)+"px";
               left = ((left>0) ? left : 0)+"px";
               $(this).css({position:'absolute', margin:0, top:top, left:left});
        } catch(err) {
               console.error("ERROR: showLoadingIndicator problem: "+err);
        }
};  */

