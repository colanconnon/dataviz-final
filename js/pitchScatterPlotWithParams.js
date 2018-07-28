function constructScatterPlotWithParams(data) {
  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  // parse the date / time
  var parseTime = d3.timeParse("%d-%b-%y");

  // set the ranges
  var x = d3.scaleLinear().range([-5, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the line

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3
    .select("#graph4")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Get the data
  // Scale the range of the data
  x.domain([-2, 2]);
  y.domain([-0, 5]);
  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  // x axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // y axis
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
  var keys = ["FF", "CH", "CU", "SL"];

  var rects = svg
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
    .text("Batter View Y")
    .attr("font-size", 12);

  return obj => {
    svg.selectAll(".bubble").remove();
    shapes
      .append("circle")
      .attr("class", "bubble")
      .filter(d => {
        if ("events" in obj) {
          return d.events == obj.events;
        }
        return d;
      })
      .filter(d => {
        if ("game_year" in obj) {
          return d.game_year == obj.game_year;
        }
        return d;
      })
      .filter(d => {
        if ("stance" in obj && obj.stance !== 'A') {
          return d.stand == obj.stance;
        }
        return d;
      })
      .attr("cx", function(d) {
        return x(d.plate_x);
      })
      .attr("cy", function(d) {
        return y(d.plate_z);
      })
      .attr("r", function(d) {
        return 2.5;
      })
      .style("fill", function(d) {
        return color(d.pitch_type);
      })
      .on("mouseover", function(d) {
        var self = this;
        d3.select(this).attr("r", 6);
        svg
          .selectAll("circle")
          .filter(function (x) {
            return this != self;
          })
          .style("opacity", .2);
        tooltip.html(`Pitch Name: ${d.pitch_name} <br />
                                   Description: ${d.des} <br />
                                   Velocity: ${d.release_speed} <br/>
                                   Event: ${d.events}
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
        svg
        .selectAll("circle")
        .style("opacity", 1);
        return tooltip.style("visibility", "hidden");
      });
    return obj;
  };
}
