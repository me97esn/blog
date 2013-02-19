#= require paxos/network_member

class Harry.Client extends Batman.Object
  @::mixin Harry.NetworkMember

  nextValue: 0
  constructor: (@id, @network) ->
    super()

  propose: ->
    @nextValue += 10
    @sendMessage @replicaIDForMessges(), new Harry.SetValueMessage(@nextValue)

  replicaIDForMessges: ->
    Math.floor(Math.random() * (@network.replicas.length)) + 1
