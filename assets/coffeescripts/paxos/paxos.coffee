#= require d3.v2
#= require batman.statemachine
#= require async.min
#= require paxos/namespace
#= require_tree .

#main_demo = new Harry.NetworkVisualizer
  #selector: "#main_demo"
  #network: new Harry.Network(20)

clientOnlyNetwork = new Harry.Network
  replicaCount: 3
  baseNetworkDelay: 1000
  networkDelayVariability: 0

clientOnlyVisualization = new Harry.NetworkVisualizer
  selector: "#client_demo"
  width: 240
  height: 120
  labels: false
  network: clientOnlyNetwork
  proposeEvery: 2000
  onStart: (visualization, network) ->
    for replica in network.replicas
      replica.startTransition('mute')
    network.clients[0].replicaIDForMessages = -> network.replicas[0].id
