#= require paxos/network_member

class Harry.Client extends Batman.Object
  @::mixin Harry.NetworkMember

  nextValue: 0
  id: -1
  constructor: (@proposeEvery, @network) ->
    super()
    @network.replicas[@id] = @

  propose: =>
    @nextValue += 10
    replica = Math.round(Math.random() * (@network.length - 1))
    @sendMessage replica, new Harry.SetValueMessage(@nextValue)

    setTimeout(@propose, @proposeEvery + Math.floor(Math.random() * 1000))

  startProposals: -> @propose()
