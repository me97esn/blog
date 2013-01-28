class Harry.Replica extends Batman.StateMachine
  @transitions
    startSet: {idle: 'awaiting-promises'}
    proposalSucceeded: {'awaiting-promises': 'awaiting-commits'}
    acceptSucceeded: {'awaiting-commits': 'idle'}
    proposalFailed: {'awaiting-promises': 'idle'}
    acceptFailed: {'awaiting-commits': 'idle'}

  constructor: (@id, @quorum, @network) ->
    @value = undefined
    @highestSeenSequenceNumber = -1
    super('idle')

  setValue: (value, callback) ->
    @round = new Harry.Round
      sequenceNumber: ++@highestSeenSequenceNumber
      callback: callback
      value: value
      promisesReceived: 0
      commitsReceived: 0

    @startTransition 'startSet'
    @broadcastMessage new Harry.PrepareMessage(@round.sequenceNumber)

  getValue: ->

  processMessage: (message) ->
    switch @get('state')
      when 'awaiting-promises'
        switch message.constructor
          when Harry.PromiseMessage         then @promiseReceived(message)
          when Harry.RejectProposalMessage  then @promiseRejectionReceived(message)
      when 'awaiting-commits'
        switch message.constructor
          when Harry.CommittedMessage       then @commitReceived(message)
      when 'idle'
        switch message.constructor
          when Harry.QueryMessage           then @queryReceived(message)
          when Harry.PrepareMessage         then @prepareReceived(message)
          when Harry.AcceptMessage          then @acceptReceived(message)

  @::on 'proposalFailed', 'acceptFailed', ->
    @round.callback? new Error("value not written")
    delete @round

  promiseReceived: ->
    @round.promisesReceived += 1
    if @round.promisesReceived > @quorum
      acceptRequest = new Harry.AcceptMessage(@round.sequenceNumber, @round.value)
      @broadcastMessage(acceptRequest)
      @startTransition 'proposalSucceeded'

  promiseRejectionReceived: ->
    @startTransition 'proposalFailed'

  commitReceived: ->
    @round.commitsReceived += 1
    if @round.commitsReceived > @quorum
      @startTransition('acceptSucceeded')
      @round.callback?()

  queryReceived: (message) -> @sendMessage(message.sender, new Harry.QueryResponseMessage(@value))

  prepareReceived: (message) ->
    response = if message.sequenceNumber > @highestSeenSequenceNumber
      new Harry.PromiseMessage()
    else
      new Harry.RejectProposalMessage(@highestSeenSequenceNumber)
    @sendMessage(message.sender, response)

  acceptReceived: (message) ->
    if message.sequenceNumber > @highestSeenSequenceNumber
      @highestSeenSequenceNumber = message.sequenceNumber
      @value = message.value
      @sendMessage(message.sender, new Harry.CommittedMessage(@highestSeenSequenceNumber))

  sendMessage: (destinationID, message) -> @network.sendMessage(@id, destinationID, message)
  broadcastMessage: (message) -> @network.broadcastMessage(@id, message)
