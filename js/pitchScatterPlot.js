function constructScatterPlot(data) {
  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([-5, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var keys = ["FF", "CH", "CU", "SL"];


  var svg = d3
    .select("#graph3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);


  x.domain([-2, 2]);
  y.domain([-0, 5]);
  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("x", 190)
    .attr("y", y(y.ticks().pop()))
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Pitch Location of Strikeouts (Gray area is strike zone)");

  var square = [{ x1: 110, x2: 310, y1: 55, y2: 180 }];

  svg
    .selectAll(".squares")
    .data(square)
    .enter()
    .append("rect")
    .attr("x", d => d.x1)
    .attr("y", d => d.y1)
    .attr("width", d => d.x2 - d.x1)
    .attr("height", d => d.y2 - d.y1)
    .attr("opacity", 0.2);

  var shapes = svg
    .selectAll(".bubble")
    .data(data)
    .enter();

  function drawBubblesForYear(year, text) {
    $("#strikeOutTxt").html(text);
    svg.selectAll(".bubble").remove();
    shapes
      .append("circle")
      .attr("class", "bubble")
      .filter(d => d.events == "strikeout" && d.game_year == year)
      .attr("cx", function(d) {
        return x(d.plate_x);
      })
      .attr("cy", function(d) {
        return y(d.plate_z);
      })
      .attr("r", function(d) {
        return 2;
      })
      .style("fill", function(d) {
        return color(d.pitch_type);
      })
      .on("mouseover", function(d) {
        var self = this;
        d3.select(this).attr("r", 6);
        svg
          .selectAll("circle")
          .filter(function(x) {
            return this != self;
          })
          .style("opacity", 0.2);
        tooltip.html(`Pitch Name: ${d.pitch_name} <br />
                                   Description: ${d.des} <br />
                                   Velocity: ${d.release_speed} <br/>
                                   Event: ${d.events} <br />
                                   Game Date: ${d.game_date}
                             `);
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip
          .style("top", d3.event.pageY - 10 + "px")
          .style("left", d3.event.pageX + 10 + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 2.5);
        svg.selectAll("circle").style("opacity", 1);
        return tooltip.style("visibility", "hidden");
      });
  }

  var legend = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 8)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter()
    .append("g")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 10) + ")"
    )
    .style("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Batter View X (Home Plate is center)");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Batter View Y (Height from ground)")
    .attr("font-size", 12);

  legend
    .append("rect")
    .attr("x", width)
    .attr("width", 10)
    .attr("height", 19)
    .attr("fill", color);

  legend
    .append("text")
    .attr("x", width - 3)
    .attr("y", 10.5)
    .attr("dy", "0.32em")
    .text(function(d) {
      return pitchTypeLookup[d];
    });
  return year => {
    var years = [
      {
        year: 2008,
        text:
          "Year: 2008. <br /> Early in JV's career he relied on mainly on the fastball, curveball, and changeup"
      },
      { year: 2009, text: "Year: 2009 <br /> JV started throwing a few sliders, but still mainly stuck fastball, curveball, and changeup" },
      { year: 2010, text: "Year: 2010 <br /> JV Started to throw the slider more, especially to get hitters to chase outside the strike zone." },
      { year: 2011, text: "Year: 2011 <br /> JV won MVP this season as he started to get more people out with the slider out of the zone." },
      { year: 2012, text: "Year: 2012 <br /> He kept the slider more in the strike zone this year, not getting hitters to chase as much." },
      { year: 2013, text: "Year: 2013 <br /> JV starts to throw the change up less and getting hitters to chase the slider outside the strikezone again" },
      { year: 2014, text: "Year: 2014 <br /> JV's strikeout totals really start to drop, especially on fastballs." },
      {
        year: 2015,
        text:
          "Year: 2015.<br />  He had an injury in 2015, really causing his velocity fastball to drop, and it causes his strikeout total to plummet"
      },
      { year: 2016, text: "Year: 2016 <br /> After coming back from a bad 2015 season, we see his fastball becomes more effective than 2015." },
      {
        year: 2017,
        text:
          "Year: 2017. <br /> He really starts to throw the slider more and getting hitters to chase outside the zone."
      },
      { year: 2018, text: "Year: 2018 <br /> JV has been sticking with the slider and dropped the changeup which he used a lot earlier in his career." }
    ];
    var obj = years.filter(function(x) {
      return x.year == year;
    })[0];
    drawBubblesForYear(obj.year, obj.text, svg, shapes);
  };
}
