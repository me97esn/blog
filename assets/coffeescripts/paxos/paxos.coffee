#= require d3.v2
#= require batman.statemachine
#= require async.min
#= require_self
#= require_tree .

window.Harry = {}

w = 620
h = 620
count = 20
y = d3.scale.ordinal().domain(d3.range(count)).rangePoints([20, w - 20])
t = Date.now()

glower = (brighter) ->
  destination = if brighter
    "rgb(158, 0, 250)"
  else
    "rgb(98, 0, 156)"

  return (selection) ->
    started = false

    selection.transition()
      .duration(1000)
      .ease('qubic')
      .attr('fill', destination)
      .each "end", ->
        return false if started
        started = true
        selection.call glower(!brighter)

svg = d3.select("#first")
  .append("svg:svg")
  .attr("width", w)
  .attr("height", h)

radiusStep = (Math.PI * 2) / count
yScale = d3.scale.linear().domain([-1, 1]).range([20, h - 20])
xScale = d3.scale.linear().domain([-1, 1]).range([20, w - 20])
circle = svg.selectAll("circle")
    .data(y.domain())
  .enter()
    .append("svg:circle")
    .attr("r", 16)
    .attr("cx", (d) -> xScale Math.sin(d * radiusStep))
    .attr("cy", (d) -> yScale Math.cos(d * radiusStep))
    .attr("fill", "rgb(98, 0, 156)")
    .call(glower(true))

