class Harry.Network extends Batman.Object
  baseNetworkDelay: 1000
  networkDelayVariability: 2
  clientCount: 1
  replicaCount: 10

  constructor: (optionsOrReplicaCount) ->
    if Batman.typeOf(optionsOrReplicaCount) is 'Number'
      super({replicaCount: optionsOrReplicaCount})
    else
      super(optionsOrReplicaCount)

    @quorum ?= Math.ceil(@replicaCount / 2)
    @maxAdditionalNetworkDelay ?= @networkDelayVariability * @baseNetworkDelay
    @nextMessageID = 0
    @activeMessages = new Batman.SimpleSet

    @replicas = (new Harry.Replica(i, @quorum, @) for i in [1..@replicaCount])
    @clients = (new Harry.Client(-1 * i, @) for i in [1..@clientCount])

    @entitiesById = @replicas.concat(@clients).reduce (acc, entity) ->
      acc[entity.id] = entity
      acc
    , {}

  sendMessage: (originID, destinationID, message) ->
    if @canSend(originID, destinationID)
      message.id = ++@nextMessageID
      message.sender = originID
      message.destination = destinationID
      message.flightTime = @baseNetworkDelay + Math.floor(Math.random() * @maxAdditionalNetworkDelay)
      if message.sender > 0 && message.destination > 0 && Math.random() < 0.3
        d3.timer =>
          @destroyMessage(message)
          true
        , (message.flightTime / 2)
      @_deliverMessageIn(message.flightTime, message)

  broadcastMessage: (originID, message) ->
    for replica in @replicas when replica.id != originID
      @sendMessage(originID, replica.id, message.clone())

  destroyMessage: (message) ->
    console.warn "Destroying non-inflight message", message unless @activeMessages.has(message)
    @activeMessages.remove(message)
    message.fire 'destroyed'

  canSend: (originID, destinationID) -> true

  _deliverMessageIn: (time, message) ->
    @fire 'messageSent', message, time
    @activeMessages.add(message)
    d3.timer =>
      if @activeMessages.has(message)
        @entitiesById[message.destination].processMessage(message)
        message.fire 'delivered'
        @activeMessages.remove(message)
      true
    , time
