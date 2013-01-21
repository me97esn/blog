class Harry.Replica extends Batman.StateMachine
  @transitions
    startSet: {listening: 'awaiting-proposal'}
    proposalSucceeded: {'awaiting-proposal': 'awaiting-accepts'}
    acceptSucceeded: {'awaiting-accepts': 'committing'}
    commitSucceeded: {'committing': 'listening'}
    proposalFailed: {'awaiting-proposal': 'listening'}
    acceptFailed: {'awaiting-accepts': 'listening'}
    commitFailed: {'committing': 'listening'}

  constructor: (@id, @network) ->
    @highestSeenSequenceNumber = -1
    super('listening')

  setValue: (value, callback) ->
    # broadcast proposal
    sequenceNumber = ++@highestSeenSequenceNumber
    async.series [
      ((callback) ->
        @startTransition 'startSet'
        @broadcastMessage(new Harry.PrepareMessage(sequenceNumber))
        @awaitProposalAcceptance(callback)
      ),((callback) ->
        @startTransition 'proposalSucceeded'
        @broadcastMessage(new Harry.AcceptMessage(value, sequenceNumber))
        @awaitAcceptAcceptance(callback)
      ),((callback) ->
        @startTransition 'acceptSucceeded'
        @broadcastMessage(new Harry.CommitMessage(sequenceNumber))
        @awaitCommit(callback)
      ),((callback) ->
        @startTransition 'commitFailed'
        callback()
      )
    ], callback

    # wait for proposal results
    # broadcast accept
    # wait for acks
    # broadcast commit

  getValue: ->

  sendMessage: (destinationID, message) -> @network.sendMessage(@id, destinationID, message)
  broadcastMessage: (message) -> @network.broadcastMessage(@id, message)
  processMessage: (message) ->
