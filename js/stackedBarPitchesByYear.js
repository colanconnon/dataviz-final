function constructStackedBarPitchesByYear(data) {
  data = JSON.parse(JSON.stringify(data));
  var svg = d3.select("#graph1a"),
    margin = { top: 20, right: 100, bottom: 45, left: 50 },
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

  data = data.reduce(function(r, e) {
    if (e.pitch_type === "" && e.release_speed === "") {
      return r;
    }
    let element = r.find(x => x.year == e.game_year);
    if (element) {
    } else {
      r.push({
        year: e.game_year,
        Count: 0,
        FF: 0,
        FF_total_speed: 0,
        SL: 0,
        SL_total_speed: 0,
        CH: 0,
        CH_total_speed: 0,
        CU: 0,
        CU_total_speed: 0
      });
    }
    element = r.find(x => x.year == e.game_year);
    if (element) {
      if (e.pitch_type in element) {
        element[`${e.pitch_type}_total_speed`] =
          Number(element[`${e.pitch_type}_total_speed`]) +
          Number(e.release_speed);
        element[e.pitch_type] = element[e.pitch_type] + 1;
        element.Count = element.Count + 1;
      }
    }
    return r;
  }, []);
  var keys = ["FF", "CH", "CU", "SL"];

  data.sort(function(a, b) {
    return Number(a.year) - Number(b.year);
  });
  x.domain(
    data.map(function(d) {
      return d.year;
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
      return color(d.key);
    })
    .selectAll("rect")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.data.year);
    })
    .attr("y", function(d) {
      return y(d[1]);
    })
    .attr("height", function(d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", x.bandwidth())
    .on("mouseover", function(d) {
      let event = Object.keys(d.data).find(k => d.data[k] == d[1] - d[0]);
      tooltip.html(`
        Count: ${d[1] - d[0]}
        Pitch: ${pitchTypeLookup[event]},
        AVG Speed: ${Math.round(d.data[`${event}_total_speed`] / d.data[event])}
        `);
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

  g.append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 10) + ")"
    )
    .style("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Year");

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 170)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("font-size", 20)
    .text("Pitch Break down by year");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count Of Pitches Thrown")
    .attr("font-size", 10);

  var legend = g
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
}
