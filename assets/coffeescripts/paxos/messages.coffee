class Harry.AbstractMessage
  clone: ->
    clone = new @constructor
    for own k,v of @
      clone[k] = v
    clone

class Harry.PrepareMessage extends Harry.AbstractMessage
  constructor: (@sequenceNumber) -> super
  type: 1

class Harry.PromiseMessage extends Harry.AbstractMessage
  type: 2

class Harry.RejectProposalMessage extends Harry.AbstractMessage
  constructor: (highestSeenSequenceNumber) -> super
  type: 3

class Harry.AcceptMessage extends Harry.AbstractMessage
  constructor: (@sequenceNumber, @value) -> super
  type: 4

class Harry.CommittedMessage extends Harry.AbstractMessage
  constructor: (@sequenceNumber) -> super
  type: 5

class Harry.QueryMessage extends Harry.AbstractMessage
  type: 6

class Harry.QueryResponseMessage extends Harry.AbstractMessage
  constructor: (@sequenceNumber, @value) ->
  type: 7
