glower = (goBrighter) ->
  destination = if goBrighter
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
        selection.call glower(!goBrighter)

class Harry.NetworkVisualizer
  width: 620
  height: 620

  constructor: (options) ->
    Batman.extend(@, options)
    @count = @network.length

    @svg = d3.select(@selector)
      .append("svg:svg")
      .attr("width", @width)
      .attr("height", @height)

    @replicaRadiusStep = (Math.PI * 2) / @count
    @replicaYScale = d3.scale.linear().domain([-1, 1]).range([20, @height - 20])
    @replicaXScale = d3.scale.linear().domain([-1, 1]).range([20, @width - 20])

    @drawReplicas()
    @attachMessageHandlers()

    propose = =>
      replica = Math.round(Math.random() * (@network.length - 1))
      @network.replicas[replica].setValue(10)
      setTimeout(propose, 7000 + Math.floor(Math.random() * 1000))

    propose()

  drawReplicas: ->
    replicas = (value for key, value of @network.replicas)
    @replicaCircles = @svg.selectAll("circle.replica")
        .data(replicas)
      .enter()
        .append("svg:circle")
        .attr("class", "replica")
        .attr("r", 16)
        .attr("cx", (replica) => @replicaX(replica.id))
        .attr("cy", (replica) => @replicaY(replica.id))
        .attr("fill", "rgb(98, 0, 156)")
        .call(glower(true))

  attachMessageHandlers: ->
    @inFlightMessages = []
    @messageTypeColor = d3.scale.category10()
    @network.on 'messageSent', (message, flightTime) =>
      @inFlightMessages.push(message)
      @svg.selectAll("circle.message")
        .data(@inFlightMessages, (message) -> message.id)
        .enter()
          .append("svg:circle")
          .attr("class", "message")
          .attr("r", 8)
          .attr("cx", (message) => @replicaX(message.sender))
          .attr("cy", (message) => @replicaY(message.sender))
          .attr("fill", (message) => @messageTypeColor(message.type))
          .transition()
            .duration(flightTime)
            .attr("cx", (message) => @replicaX(message.destination))
            .attr("cy", (message) => @replicaY(message.destination))
            .remove()
            .each("end", (message) =>
              @inFlightMessages.splice(@inFlightMessages.indexOf(message), 1)
            ).ease()

  replicaX: (id) => @replicaXScale(Math.sin(id * @replicaRadiusStep))
  replicaY: (id) => @replicaYScale(Math.cos(id * @replicaRadiusStep))
