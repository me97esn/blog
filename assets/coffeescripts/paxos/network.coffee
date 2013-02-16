class Harry.Network extends Batman.Object
  baseNetworkDelay: 1000
  networkDelayVariability: 2

  constructor: (@length, @baseNetworkDelay = 1000, @networkDelayVariability = 2) ->
    super
    @quorum ?= (@length / 2) + 1
    @replicas = {}
    @nextMessageID = 0

    for i in [0...length]
      @replicas[i] = new Harry.Replica(i, @quorum, @)

    @maxAdditionalNetworkDelay = @networkDelayVariability * @baseNetworkDelay

  sendMessage: (originID, destinationID, message) ->
    if @canSend(originID, destinationID)
      message.id = ++@nextMessageID
      message.sender = originID
      message.destination = destinationID
      flightTime = @baseNetworkDelay + Math.floor(Math.random() * @maxAdditionalNetworkDelay)
      @_deliverMessageIn(flightTime, message)

  broadcastMessage: (originID, message) ->
    for destinationID, _ of @replicas
      @sendMessage(originID, destinationID, message.clone())

  canSend: (originID, destinationID) -> true

  _deliverMessageIn: (time, message) ->
    @fire 'messageSent', message, time
    setTimeout =>
      @replicas[message.destination].processMessage(message)
    , time
