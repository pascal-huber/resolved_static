---
title: 'VoteLog'
description: 'VoteLog - a webapp to keep track of my decisions and compare them with parties.'
created: '2023-03-01T15:00:00+01:00'
updated: '2023-03-01T15:10:00+01:00'
tags: ['swiss', 'politics', 'dev']
keywords: ['votelog', 'swiss', 'politics']
---

A webapp to keep track of my decisions and compare them with parties.

# DESCRIPTION

At the end of a legislative term, I want to see which parties let me down and
which didn't. There are more sophisticated ways to measure and compare ones
political orientation such as *Smart Spiders* [[1]]. VoteLog, however, is
simpler as you only have to enter your answers on national initiatives and
referendums. It also helps me remember what I voted on issues long ago.

# TECHNICAL

VoteLog is written with Vue.js. It comes without a backend but rather lets you
   load and store your data on the WebDAV server of your choice (given that it
   sets permissive CORS [[2]] headers).

# SEE ALSO

- [https://votelog.resolved.ch](https://votelog.resolved.ch)
- [github.com/pascal-huber/votelog](https://github.com/pascal-huber/votelog)

# TAGS

<!--##tag_list##-->

[1]: https://www.smartvote.ch/de/group/2/election/19_ch_nr/matching/results/my-smartspider?rid=ace38364-7ee2-441d-9f3d-552560b62851
[2]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
