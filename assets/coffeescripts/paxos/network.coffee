class Harry.Network
  constructor: (@replicas) ->

  sendMessage: (originID, destinationID, message) ->
    if @canSend(originID, destinationID)
      setTimeout ->
        @replicas[destinationID].processMessage(message)
      10

  broadcastMessage: (originID, message) ->
    for destinationID, _ of @replicas
      @sendMessage(originID, destinationID, message)

  canSend: (originID, destinationID) -> true

