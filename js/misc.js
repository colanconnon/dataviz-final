var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
var x = d3.scaleLinear().range([-5, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line


// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

// gridlines in x axis function
function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(5)
}

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
}
var row = svg.selectAll(".row")
.data([[{x:350, y:200}], [{x:350, y:250}], [{x:350, y:300}]])
.enter().append("g")
.attr("width", 15)
.attr("height", 15)
.attr("class", "row");


// Get the data
d3.csv("verlander.csv").then(data => {


  // Scale the range of the data
  x.domain([-3, 3]);
  y.domain([-1, 7]);

 

 var color = d3.scaleOrdinal(d3.schemeCategory20);

//   add the valueline path.
  var bubble = svg.selectAll('.bubble')
  .data(data)
  .enter().append('circle')
  .attr('class', 'bubble')
  .attr('cx', function(d){return x(d.plate_x);})
  .attr('cy', function(d){ return y(d.plate_z);})
  .attr('r', function(d){ return 3 })
  .style('fill', function(d){ return color(d.pitch_type); });

//   svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));

//   // add the Y Axis
//   svg.append("g")
//       .call(d3.axisLeft(y));
var column = row.selectAll(".square")
  .data(function(d) { return d; })
  .enter().append("rect")
  .attr("class","square")
  .attr("x", function(d) { return d.x; })
  .attr("y", function(d) { return d.y; })
  .attr("width", function(d) { return 50; })
  .attr("height", function(d) { return 50; })
  .style("fill", "#999")
  .style("stroke", "#222");

});
  