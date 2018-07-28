var color = d3.scaleOrdinal(d3.schemeCategory10);
var updateStrikeoutsByYear = null;
var updatePitchScatter = null;
var pitchTypeLookup = {
  "FF": "Fastball",
  "SL": "Slider",
  "CU": "Curveball",
  "CH": "Change Up"
}
var tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("color", "white")
  .style("padding", "8px")
  .style("background-color", "rgba(0, 0, 0, 0.75)")
  .style("border-radius", "6px")
  .style("font", "12px sans-serif")
  .text("tooltip");

var promise1 = d3.csv("verlander_pitches.csv");
var promise2 = d3.csv("verlander_stats.csv");

Promise.all([promise1, promise2]).then((data) => {
  $(".reveal").fadeIn();
  Reveal.initialize({
    controls: true,
    controlsTutorial: true,
    controlsLayout: "bottom-right",
    controlsBackArrows: "faded",
    progress: true,
    center: false,
    slideNumber: true,
    help: true,
    history: true,
    // minScale: 1,
    // maxScale: 1
  });
  constructStackedBarPitchesByYear(data[0]);
  constructPitchGraph(data[0]);
  constructStatLineGraph(data[1], data[0]);
  // constructStackBarChart(data);
  updatePitchScatter = constructScatterPlotWithParams(data[0]);
  updatePitchScatter({ game_year: 2008, events: "strikeout" });
  updateStrikeoutsByYear = constructScatterPlot(data[0]);
  updateStrikeoutsByYear(2008);
});

var filterOptions = { game_year: 2008, events: "strikeout" };
$("#pitchSctYearSlt").on("change", function() {
  filterOptions = updatePitchScatter({
    game_year: this.value,
    events: filterOptions.events
  });
});

$("#pitchSctEventSlt").on("change", function() {
  filterOptions = updatePitchScatter({
    game_year: filterOptions.game_year,
    events: this.value
  });
});

var year = 2008;
$("#btnClickAdd").on("click", function() {
  year = year + 1;
  updateStrikeoutsByYear(year);
});

$("#btnClickSub").on("click", function() {
  year = year - 1;
  updateStrikeoutsByYear(year);
});



function constructStackBarChart(data) {
  data = JSON.parse(JSON.stringify(data));
  var svg = d3.select("#graph2"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3
    .scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

  var y = d3.scaleLinear().rangeRound([height, 0]);

  var z = d3
    .scaleOrdinal()
    .range([
      "#3366cc",
      "#dc3912",
      "#ff9900",
      "#109618",
      "#990099",
      "#0099c6",
      "#dd4477",
      "#66aa00",
      "#b82e2e",
      "#316395",
      "#994499",
      "#22aa99",
      "#aaaa11",
      "#6633cc",
      "#e67300",
      "#8b0707",
      "#651067",
      "#329262",
      "#5574a6",
      "#3b3eac"
    ]);

  data = data.reduce(function(r, e) {
    if (e.pitch_type === "" && e.release_speed === "") {
      return r;
    }
    let element = r.find(x => x.Name === e.pitch_type);
    if (element) {
    } else {
      r.push({
        Name: e.pitch_type,
        FullName: e.pitch_name,
        Count: 0,
        total_speed: Number(e.release_speed),
        home_run: 0,
        home_run_total_speed: 0,
        single: 0,
        single_total_speed: 0,
        double: 0,
        double_total_speed: 0,
        triple: 0,
        triple_total_speed: 0,
        strikeout: 0,
        strikeout_total_speed: 0,
        field_out: 0,
        field_out_total_speed: 0
      });
    }
    element = r.find(x => x.Name === e.pitch_type);
    if (element) {
      if (e.events in element) {
        element[e.events] = element[e.events] + 1;
        element[`${e.events}_total_speed`] =
          Number(element[`${e.events}_total_speed`]) + Number(e.release_speed);
        element.total_speed = element.total_speed + Number(e.release_speed);
        element.Count = element.Count + 1;
      }
    }
    return r;
  }, []);
  var keys = [
    "strikeout",
    "field_out",
    "home_run",
    "single",
    "double",
    "triple"
  ];

  data.sort(function(a, b) {
    return b.Count - a.Count;
  });
  console.log(data);
  x.domain(
    data.map(function(d) {
      return d.FullName;
    })
  );
  y.domain([
    0,
    d3.max(data, function(d) {
      return d.Count;
    })
  ]).nice();

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter()
    .append("g")
    .attr("fill", function(d) {
      return z(d.key);
    })
    .selectAll("rect")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.data.FullName);
    })
    .attr("y", function(d) {
      return y(d[1]);
    })
    .attr("height", function(d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", x.bandwidth())
    .on("mouseover", function(d) {
      console.log(d);
      let event = Object.keys(d.data).find(k => d.data[k] == d[1] - d[0]);
      tooltip.html(`Count: ${d[1] - d[0]} <br /> 
                  Event: ${event} <br />
                  Avg Speed: ${Math.round(
                    d.data[`${event}_total_speed`] / d.data[event]
                  )}`);
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function() {
      return tooltip.style("visibility", "hidden");
    });

  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("Pitch Count By Event");

  var legend = g
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter()
    .append("g")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend
    .append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) {
      return d;
    });
}

// pitch data by year
