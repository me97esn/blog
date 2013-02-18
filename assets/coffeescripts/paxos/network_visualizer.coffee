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
  @messageTypeColor: d3.scale.category10()
  @valueScale: d3.scale.category10()

  width: 660
  height: 620
  labels: true
  nextValue: 0
  proposeEvery: 10000

  constructor: (options) ->
    Batman.extend(@, options)
    @count = @network.length
    @inFlightMessages = []
    @clients = [new Harry.Client(@proposeEvery, @network)]

    @svg = d3.select(@selector)
      .append("svg:svg")
      .attr("width", @width)
      .attr("height", @height)

    @replicaRadiusStep = (Math.PI * 2) / @count
    @entityYScale = d3.scale.linear().domain([-1, 1]).range([20, @height - 20])
    @entityXScale = d3.scale.linear().domain([-1, 1]).range([20, @width - 60])

    @drawReplicas()
    @drawReplicaLabels()
    @drawClients()
    @attachMessageHandlers()
    @attachValueHandlers()

    @onStart?(@, @network)

    for client in @clients
      client.propose()

  drawReplicas: ->
    @replicaCircles = @svg.selectAll("circle.replica")
        .data(@network.replicas)
        .attr("fill", (replica) => @constructor.valueScale(replica.value))

    @replicaCircles.enter()
        .append("svg:circle")
        .attr("class", "replica")
        .attr("r", 16)
        .attr("cx", (replica) => @entityX(replica.id))
        .attr("cy", (replica) => @entityY(replica.id))

  drawReplicaLabels: ->
    return unless @labels
    @sequenceNumberLabels = @svg.selectAll("text.sequence-number-label").data(@network.replicas)
    @sequenceNumberLabels
      .text((replica) -> replica.highestSeenSequenceNumber)
      .enter()
        .append("svg:text")
        .attr("class", "replica-label sequence-number-label")
        .attr("x", (replica) => @entityX(replica.id) + 23)
        .attr("y", (replica) => @entityY(replica.id) - 8)
        .text((replica) -> replica.highestSeenSequenceNumber)

    @stateLabels = @svg.selectAll("text.state-label").data(@network.replicas)
    @stateLabels
      .text((replica) -> replica.get('state'))
      .enter()
        .append("svg:text")
        .attr("class", "replica-label state-label")
        .attr("x", (replica) => @entityX(replica.id) + 23)
        .attr("y", (replica) => @entityY(replica.id) + 16)
        .text((replica) -> replica.get('state'))

    @valueLabels = @svg.selectAll("text.value-label").data(@network.replicas)
    @valueLabels
      .text((replica) -> replica.get('value'))
      .enter()
        .append("svg:text")
        .attr("class", "replica-label value-label")
        .attr("x", (replica) => @entityX(replica.id) + 23)
        .attr("y", (replica) => @entityY(replica.id) + 4)
        .text((replica) -> replica.get('value'))

  drawClients: ->
    @clientCircles = @svg.selectAll("circle.client")
      .data(@clients)

    @clientCircles
      .enter()
        .append("svg:circle")
        .attr("fill", "#FF00F0")
        .attr("class", "client")
        .attr("r", 20)
        .attr("cx", (replica) => @entityXScale(0))
        .attr("cy", (replica) => @entityYScale(0))

  attachMessageHandlers: ->
    @network.on 'messageSent', (message, flightTime) =>
      @inFlightMessages.push(message)
      @svg.selectAll("circle.message")
        .data(@inFlightMessages, (message) -> message.id)
        .enter()
          .append("svg:circle")
          .attr("class", "message")
          .attr("r", 8)
          .attr("cx", (message) => @entityX(message.sender))
          .attr("cy", (message) => @entityY(message.sender))
          .attr("fill", (message) => @constructor.messageTypeColor(message.type))
          .transition()
            .duration(flightTime)
            .attr("cx", (message) => @entityX(message.destination))
            .attr("cy", (message) => @entityY(message.destination))
            .remove()
            .each("end", (message) =>
              @inFlightMessages.splice(@inFlightMessages.indexOf(message), 1)
            ).ease()

  attachValueHandlers: ->
    redraw = =>
      @drawReplicas()
      @drawReplicaLabels()

    @network.replicas.forEach (replica) =>
      for key in ['state', 'highestSeenSequenceNumber']
        replica.observe key, redraw

      replica.observe 'value', =>
        redraw()
        @emitValueChange(replica)

  emitValueChange: (replica) ->
    #TODO: z index below replica
    orb = @svg.selectAll("circle.value-change.replica-#{replica.id}")
        .data([1])
        .enter()
        .append("svg:circle")
        .attr("fill", "#CC0000")
        .attr("class", "value-change replica-#{replica.id}")
        .attr("r", 17)
        .attr("opacity", 0.6)
        .attr("cx", @entityX(replica.id))
        .attr("cy", @entityY(replica.id))
        .transition()
          .duration(1000)
          .attr("r", 40)
          .attr("opacity", 0)
          .remove()
          .ease()

  entityX: (id) =>
    position = if id == -1
      0
    else
      Math.cos(id * @replicaRadiusStep)
    @entityXScale(position)

  entityY: (id) =>
    position = if id == -1
      0
    else
      Math.sin(id * @replicaRadiusStep)
    @entityYScale(position)
