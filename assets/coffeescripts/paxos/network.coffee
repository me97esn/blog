class Harry.Network extends Batman.Object
  constructor: (@length, quorum) ->
    super()
    @quorum ?= (@length / 2) + 1
    @replicas = {}
    @nextMessageID = 0
    for i in [0...length]
      @replicas[i] = new Harry.Replica(i, @quorum, @)

  sendMessage: (originID, destinationID, message) ->
    if @canSend(originID, destinationID)
      message.id = ++@nextMessageID
      message.sender = originID
      message.destination = destinationID
      flightTime = 2000 + Math.floor(Math.random() * 1000)
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
