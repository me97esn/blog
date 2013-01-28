#= require d3.v2
#= require batman.statemachine
#= require async.min
#= require paxos/namespace
#= require_tree .

first = new Harry.Network(20)
vis = new Harry.NetworkVisualizer
  selector: "#first"
  network: first
