#= require d3.v2
#= require batman.statemachine
#= require async.min
#= require paxos/namespace
#= require_tree .

#main_demo = new Harry.NetworkVisualizer
  #selector: "#main_demo"
  #network: new Harry.Network(20)
  #proposeEvery: 13000

client_only = new Harry.NetworkVisualizer
  selector: "#client_demo"
  network: new Harry.Network(1)
  labels: false
  proposeEvery: 2000
  baseNetworkDelay: 800
  networkDelayVariability: 0
