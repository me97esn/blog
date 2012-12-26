#= require d3.v2
#= require_self
#= require_tree .

window.Harry = {}

w = 960
h = 500
y = d3.scale.ordinal().domain(d3.range(30)).rangePoints([20, w - 20])
t = Date.now()

makeSlide = (x0, x1) ->
  t += 50
  return ->
    d3.select(this)
      .transition()
      .duration(t - Date.now())
      .attr("cx", x1)
      .each "end", makeSlide(x1, x0)

glower = (brighter) ->
  destination = if brighter
    "rgba(224, 13, 98, 1)"
  else
    "rgba(224, 13, 98, 0.6)"

  return (selection) ->
    started = false

    selection.transition()
      .duration(2000)
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

circle = svg.selectAll("circle")
    .data(y.domain())
  .enter()
    .append("svg:circle")
    .attr("r", 16)
    .attr("cx", y)
    .attr("cy", -> Math.random() * (h - 40) + 20)
    .call(glower(true))
