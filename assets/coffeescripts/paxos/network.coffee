class Harry.Network extends Batman.Object
  baseNetworkDelay: 1000
  networkDelayVariability: 2

  constructor: (@length, @baseNetworkDelay = 1000, @networkDelayVariability = 2) ->
    super()
    @quorum = (@length / 2) + 1
    @maxAdditionalNetworkDelay = @networkDelayVariability * @baseNetworkDelay
    @nextMessageID = 0

    @replicas = (new Harry.Replica(i, @quorum, @) for i in [0...length])
    @replicasById = @replicas.reduce (acc, replica) ->
      acc[replica.id] = replica
      acc
    , {}

  sendMessage: (originID, destinationID, message) ->
    if @canSend(originID, destinationID)
      message.id = ++@nextMessageID
      message.sender = originID
      message.destination = destinationID
      flightTime = @baseNetworkDelay + Math.floor(Math.random() * @maxAdditionalNetworkDelay)
      @_deliverMessageIn(flightTime, message)

  broadcastMessage: (originID, message) ->
    for replica in @replicas when replica.id != originID
      @sendMessage(originID, replica.id, message.clone())

  canSend: (originID, destinationID) -> true

  _deliverMessageIn: (time, message) ->
    @fire 'messageSent', message, time
    setTimeout =>
      @replicas[message.destination].processMessage(message)
    , time
