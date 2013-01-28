---
title: Neat Algorithms - Paxos
date: 19/09/2012


This is an article on an extraordinarily neat algorithm called Paxos. Paxos is a strategy for teaching a whole bunch of decidedly unreliable computers to agree on stuff. More formally: it allows a group of unreliable processors to deterministically and safely reach consensus if it's conditions are met while ensuring processors remain consistent if consensus can't be reached.

# I disagree

If you are, say, a piece of e-commerce software, and you want a record of when your customers buy stuff, how might you ensure that how can you get a record of each transaction every single time one happens? You certainly can't leave it on one computer since that computer's disk might die, leaving you with none of your data. You could put it on two computers, but you'd have to make sure that you write the information to both computers before you let the transaction occur, so that if one failed you'd have a backup copy on both computers. If, say, your data set grew to be too large to fit on one computer, You could network of computers who's communication links

The consensus problem is one of the quintessential building blocks of distributed systems, and seems to be regarded as one of the tougher ones from both a conceptional and software engineering point of view. The aim is to define a rigorous process for submitting a value to a cluster of machines which even in the face of individual failures, communication links breaking, faulty software, or even malicious agents in the cluster, ensures the cluster will eventually agree on what the value is. The cluster can agree to not accept a new value when one is submitted, or it can take a significant amount of time to accept if it will, but the key point is that by the end of the process, the cluster is in agreement of what the "true" value is. Agreement is often defined as what the majority of the cluster reports the value to be, although this is not the only approach.

The reasons this problem is challenging mostly arise from the simple fact that computers are unreliable. Disks fail, cords get unplugged, engineers write bugs, and all the while us humans just want them to work. It wouldn't be too tough to write a consensus algorithm I shall enjoy titling "lol dunno" which fails and rejects any new incoming values in the event of any of these things. Despite "lol dunno"'s simplicity (and in most distributed system engineers' minds, uselessness) it can be more challenging to detect such failure conditions than to work around them. The consensus problem holds us engineers to a higher standard of coming up with a way for a cluster of computers with some errors to remain resilient and still accept new values for data.

# To have an argument, you must take up the contrary position

Consensus problem solvers enjoy a number of horrid subproblems stemming from the fact that they must admit that there is such a thing as time. Many clients might try to propose new value to the system around the same time, or messages between computers might arrive slowly, or even out of order. A correct implementation of a solution to the problem must guarantee that one and only one value is accepted by the system at one time, which means it must be completely resilient to conflicting proposals, and bake in some sort of prevention of two factions of the system accepting two different proposals.

<div id="first"></div>
<script src="/assets/paxos/paxos.js" type="text/javascript"></script>
<link href='/assets/paxos.css' rel='stylesheet' type='text/css' />

