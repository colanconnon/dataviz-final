function constructPitchGraph(data) {
  // deep copy the data so we don't mess
  // up for another fucntion
  data = JSON.parse(JSON.stringify(data));
  // format the data in a way the bubble graph needs
  var children = data.reduce(function(r, e) {
    if (e.pitch_type === "" && e.release_speed === "") {
      return r;
    }
    let element = r.find(x => x.Name === e.pitch_type);
    if (element) {
      element.total_speed = element.total_speed + Number(e.release_speed);
      element.Count = element.Count + 1;
    } else {
      r.push({
        Name: e.pitch_type,
        FullName: e.pitch_name,
        Count: 1,
        total_speed: Number(e.release_speed)
      });
    }
    return r;
  }, []);
  dataset = {
    children: children
  };
  var diameter = 320;
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = diameter - margin.left - margin.right,
    height = diameter - margin.top - margin.bottom;
  var bubble = d3
    .pack(dataset)
    .size([width, height])
    .padding(1.5);
  var keys = ["FF", "CH", "CU", "SL"];

  var svg = d3
    .select("#graph1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble");

  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (margin.top) + ")"
    )
    .style("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Pitches Thrown By Type");

  var nodes = d3.hierarchy(dataset).sum(function(d) {
    return d.Count;
  });

  var node = svg
    .selectAll(".node")
    .data(bubble(nodes).descendants())
    .enter()
    .filter(function(d) {
      return !d.children;
    })
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  node.append("title").text(function(d) {
    return d.data.FullName;
  });

  node
    .append("circle")
    .attr("r", function(d) {
      return d.r;
    })
    .style("fill", function(d, i) {
      return color(d.data.Name);
    });

  node
    .append("text")
    .attr("dy", ".2em")
    .style("text-anchor", "middle")
    .text(function(d) {
      return d.data.Name;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", function(d) {
      return d.r / 5;
    })
    .attr("fill", "white");

  node
    .append("text")
    .attr("dy", "1.3em")
    .style("text-anchor", "middle")
    .text(function(d) {
      return d.data.Count;
    })
    .attr("font-family", "Gill Sans", "Gill Sans MT")
    .attr("font-size", function(d) {
      return d.r / 5;
    })
    .attr("fill", "white");

  d3.select(self.frameElement).style("height", height);
  node
    .on("mouseover", function(d, i) {
      tooltip.html(`Pitch Name: ${d.data.FullName} <br /> 
                    Avg Speed: ${Math.round(
                      d.data.total_speed / d.data.Count
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
    .attr("x", width - 7)
    .attr("width", 10)
    .attr("height", 19)
    .attr("fill", color);

  legend
    .append("text")
    .attr("x", width - 12)
    .attr("y", 10.5)
    .attr("dy", "0.32em")
    .text(function(d) {
      return pitchTypeLookup[d];
    });
}
