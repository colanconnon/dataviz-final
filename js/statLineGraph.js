function constructStatLineGraph(data, pitchData) {
  var svg = d3.select("#graph0"),
    margin = { top: 20, right: 60, bottom: 50, left: 50 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  data.sort(function(a, b) {
    return b.Season - a.Season;
  });
  var parseTime = d3.timeParse("%Y");

  var PitchSpeedData = pitchData.reduce(function(r, e) {
    if (e.pitch_type === "" && e.release_speed === "") {
      return r;
    }
    let element = r.find(x => x.year == e.game_year);
    if (element) {
    } else {
      r.push({
        year: e.game_year,
        count: 0,
        total_speed: 0
      });
    }
    element = r.find(x => x.year == e.game_year);
    if (element && e.pitch_type == "FF") {
      element[`total_speed`] =
        Number(element[`total_speed`]) + Number(e.release_speed);
      element.count = element.count + 1;
    }
    return r;
  }, []);

  data.forEach(function(d) {
    d.year = d.Season
    d.Season = parseTime(Number(d.Season));
    d.WHIP = Number(d.WHIP);
  });
  var x = d3.scaleTime().rangeRound([0, width]);

  var y = d3.scaleLinear().rangeRound([height, 0]);
  var y2 = d3.scaleLinear().rangeRound([height, 0]);

  var z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3
    .line()
    .x(function(d) {
      return x(d.Season);
    })
    .y(function(d) {
      return y(d.ERA);
    });

  var line3 = d3
    .line()
    .x(function(d) {
      console.log(d);
      return x(parseTime(d.year));
    })
    .y(function(d) {
      return y2(Math.round(d.total_speed / d.count));
    });

  x.domain(
    d3.extent(data, function(d) {
      return d.Season;
    })
  ).nice();
  y.domain([
    0,
    d3.max(data, function(d) {
      return Math.max(d.WHIP, d.ERA, 8);
    })
  ]).nice();
  y2.domain([90, 99]).nice();

  g.append("g")
    .attr("fill", "#000")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("x", 170)
    .attr("y", y(y.ticks().pop()))
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("font-size", 20)
    .text("Fastball Velocity Vs. ERA");

  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + ((width / 2) + 50) + " ," + (height + margin.top + 40) + ")"
    )
    .style("text-anchor", "middle")
    .attr("font-size", 18)
    .text("Year");

    svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .attr("font-size", 14)
    .text("Earned Run Average");


    svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", width + 90)
    .attr("x", 0 - height / 2)
    .style("text-anchor", "middle")
    .attr("font-size", 14)
    .text("Fastball Velocity");

  g.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 3.5)
    .attr("cx", function(d) {
      return x(d.Season);
    })
    .attr("cy", function(d) {
      return y(d.ERA);
    });

  g.selectAll("dot")
    .data(PitchSpeedData)
    .enter()
    .append("circle")
    .attr("r", 3.5)
    .attr("cx", function(d) {
      return x(parseTime(d.year));
    })
    .attr("cy", function(d) {
      return y2(Math.round(d.total_speed / d.count));
    });

  g.append("g")
    .attr("transform", "translate(" + width + " ,0)")
    .call(d3.axisRight(y2))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end");


  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);
    
  g.append('g')
      .selectAll('.myText')
      .data(data)
      .enter()
      .append('text')
      .filter(function(d) {
        return d.year == 2014;
    })
      .attr("font-size", 8)
      .attr('x', function(d,i){
        return x(d.Season);
      })
      .attr('y', function(d,i){
        return y(d.ERA);
      })
      .attr("dy", "-3.1em")
      .text(function(d,i){
        return `Fastball Velocity Drops`;
      })
      g.append('g')
      .selectAll('.myText')
      .data(data)
      .enter()
      .append('text')
      .filter(function(d) {
        return d.year == 2014;
    })
      .attr("font-size", 8)
      .attr('x', function(d,i){
        return x(d.Season);
      })
      .attr('y', function(d,i){
        return y(d.ERA);
      })
      .attr("dy", "-1.8em")
      .text(function(d,i){
        return `ERA Rises`;
      })

  g.append("path")
    .datum(PitchSpeedData)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line3);
}
