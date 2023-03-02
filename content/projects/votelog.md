---
title: 'VoteLog'
description: 'A web application to analyze your decisions on national votes.'
created: '2023-03-01T15:00:00+01:00'
updated: '2023-03-02T12:30:00+01:00'
tags: ['swiss', 'politics', 'dev']
keywords: ['votelog', 'swiss', 'politics']
---

VoteLog is a web application to keep track of my decisions on national
referendums and initiatives and compare the results with the major parties.

![VoteLog Screenshot](/public/votelog.png "VoteLog Categories")

# DESCRIPTION

At the end of a legislative term, I want to see which parties let me down and
which didn't. It also helps me remember what I voted on issues long ago. While
there are more sophisticated ways to measure and compare ones political
orientation such as *Smart Spiders* [[1]], VoteLog is simpler as you only have
to enter your answers on national initiatives and referendums.

# TECHNICAL

VoteLog is written with Vue.js. It comes without a backend but rather lets you
load and store your data on the WebDAV server of your choice (given that it sets
permissive CORS [[2]] headers).

# SEE ALSO

- [https://votelog.resolved.ch](https://votelog.resolved.ch)
- [github.com/pascal-huber/votelog](https://github.com/pascal-huber/votelog)

# TAGS

<!--##tag_list##-->

[1]: https://www.smartvote.ch/de/group/2/election/19_ch_nr/matching/results/my-smartspider?rid=ace38364-7ee2-441d-9f3d-552560b62851
[2]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
