class Harry.AbstractMessage

class Harry.PrepareMessage extends Harry.AbstractMessage
  constructor: (@sequenceNumber) -> super()

class Harry.PromiseMessage extends Harry.AbstractMessage

class Harry.RejectProposalMessage extends Harry.AbstractMessage

class Harry.AcceptMessage extends Harry.AbstractMessage

class Harry.AcknowledgeMessage extends Harry.AbstractMessage

class Harry.CommitMessage extends Harry.AbstractMessage
