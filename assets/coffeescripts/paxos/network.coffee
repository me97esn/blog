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
      flightTime = @baseNetworkDelay + Math.floor(Math.random() * @maxAdditionalNetworkDelay)
      debugger unless @entitiesById[originID] && @entitiesById[destinationID]
      @_deliverMessageIn(flightTime, message)

  broadcastMessage: (originID, message) ->
    for replica in @replicas when replica.id != originID
      @sendMessage(originID, replica.id, message.clone())

  canSend: (originID, destinationID) -> true

  _deliverMessageIn: (time, message) ->
    @fire 'messageSent', message, time
    setTimeout =>
      @entitiesById[message.destination].processMessage(message)
    , time
