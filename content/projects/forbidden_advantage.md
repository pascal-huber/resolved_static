---
title: 'Forbidden Advantage'
description: 'My hand-wired Kinesis Advantage 2 powered by ZMK on a RP2040'
created: '2023-03-11T18:00:00+01:00'
updated: '2023-03-11T19:10:00+01:00'
tags: ['keyboards']
keywords: ['keyboards', 'kinesis', 'zmk', 'Kinesis Advantage 2']
---

This is a description of my hand-wired Kinesis Advantage 2 [[1]] running with
ZMK [[2]] and powered by an Elite-Pi board [[3]] (with a RP2040 ARM
microprocessor [[4]]). I call the result the "Forbidden Advantage".

[1]: https://kinesis-ergo.com/shop/advantage2/
[2]: https://zmk.dev/
[3]: https://splitkb.com/products/elite-pi
[4]: https://www.raspberrypi.com/products/rp2040/

![Forbidden Advantage](/public/forbidden-advantage/forbidden-advantage.jpg "Forbidden Advantage")
<center>Forbidden Advantage</center>

# BUT WHY‽

A couple of years ago, I bought the Kinesis Advantage 2 keyboard. However, I
never really got used to it and it landed in a box. What a waste of money! The
following are the major problems I was facing with my Kinesis Advantage 2.

- The spring-ping of the Cherry MX Brown switches was unbearable. The big,
  hollow plastic case makes this even worse as it resonates.
- Although the keys are positioned better than on a traditional keyboard, I
  still had to move my hands to reach some of them.
- The proprietary firmware is rather limiting and (to my knowledge) doesn't
  support more than 2 layers.

![Kinesis Advantage 2](/public/forbidden-advantage/kinesis-advantage.jpg "Kinesis Advantage 2")
<center>Kinesis Advantage 2 [[1]]</center>

# SOLUTION

Keep the case and some of the circuit boards and replace everything
else ¯\\_(ツ)_/¯. Damien Rajon did something very similar [[5]]. The difference
is that he kept all the keys (except the F-key rows). An alternative solution to
use a different controller would have been to use a custom PCB such as the *kinT
kinesis keyboard controller* made by Michael Stapelberg [[6]]. I decided against
this solution because I would still have had to use the original PCBs for the
keys in the keywells.

[5]: https://25.wf/posts/2020-02-21-qinesis.html
[6]: https://michael.stapelberg.ch/posts/2020-07-09-kint-kinesis-keyboard-controller/

There are two major open source firmwares intended for keyboards: QMK [[7]] and
ZMK [[2]]. Both of them provide all the features I require. I decided to go with
ZMK because the configuration looks much cleaner and I like the way you can
build the firmware in a github action (using docker).

[7]: https://qmk.fm/

I acquired the following bits and pieces:

- The *Elite-Pi* is a tiny board featuring the new RP2040 ARM microcontroller
  (ZMK does not yet officially support it but there es a pull-request from the
  ZMK author [[8]] - Good enough)
- *Gazzew Bobagum* silent linear switches
- *Kailh Hot-Swap sockets* (such that I can easily swap the switches if I don't
  like them)
- *1N4148 THT Diodes*.
- Wires (I sacrificed an old ethernet cable).
- A USB cable.

[8]: https://github.com/zmkfirmware/zmk/pull/1499


# PROTOTYPE

Before I started soldering the real keyboard with 40 keys, I wanted to create a
prototype to ensure everything works as expected. So I soldered together four
hot-swap sockets, put switches on them and configured the firmware [[9]]. Ohje,
what have I signed myself up for‽

[9]: https://github.com/pascal-huber/ohje

![ohje](/public/forbidden-advantage/ohje.jpg "ohje")
<center>Ohje (Prototype)</center>

# LET'S GO

I will not lie. Soldering all the hot-swap sockets and diodes took way longer
than I expcected. As you can see in the following image of the left-hand side of
the keyboard, I added some additional sockets at places where there are no
switches just in case I later decide I need more keys. I didn't bother
reverse-engineering the PCBs for the thumbclusters and just destroyed the lanes
and rewired them. And yes, I totally forgot to buy Mill-Max sockets to make them
hot-swappable. I removed the PCBs for the keys in the concave keywells as it was
thin and flexible and I don't think putting the Kailh hot-swap sockets on them
would have been wise.

![Wiring](/public/forbidden-advantage/forbidden-advantage-soldering.jpg "Wiring")
<center>Wiring of the left-hand side</center>

The switches are organized in a grid with 5 rows and 12 columns which are
connected to the microcontroller. The following image shows which key is in
which row and column. The grey keys are the ones without a switch.

![Wiring Diagram](/public/forbidden-advantage/soldering.svg "Wiring Diagrm")

# KEYMAP

This is a very difficult decision. There are tons of different layouts to choose
from. I decided to go with a colemak-dh [[10]] variant and took much inspiration
from Callum Oakley's layout [[11]].

[10]: https://colemakmods.github.io/mod-dh/
[11]: https://github.com/callum-oakley/keymap

The default layer contains most letters. By pressing "w" and "f" at the same
time produces a "q". I also have some keys for debugging on the thumb cluster.
This allows me to debug with one hand and scratch my head with the other.

![Base Layer](/public/forbidden-advantage/layer1.svg "Base Layer")

The symbols layer is active when the "SYM" key is held down. The grey keys on
the right home row are "sticky", meaning they can be released to type
combinations such as "Ctrl-C".

![SYM Layer](/public/forbidden-advantage/layer2.svg "SYM Layer")

The navigation layer is active when the "NAV" key is held down.

![NAV Layer](/public/forbidden-advantage/layer3.svg "NAV Layer")

The numbers layer is active when both the "SYM" and "NAV" keys are held down.
![SYM_NAV Layer](/public/forbidden-advantage/layer4.svg "SYM_NAV Layer")

# REGRETS 

- I forgot to buy Mill-Max sockets for the thumbclusters. The switches are
  soldered directly onto the PCB and are therefore not hot-swappable.
- Using the prototype board instead of ditectly soldering the cables onto the
  controller was a mistake. It cost me a lot of nerves and I didn't really gain
  anything. A board with lanes would probably have easier too.

# RESOURCES

- [Forbidden Advantage ZMK config](https://github.com/pascal-huber/forbidden-advantage)
- [kinT kinesis keyboard controller (by Michael
  Stapelberg)](https://michael.stapelberg.ch/posts/2020-07-09-kint-kinesis-keyboard-controller/)
- [Handwiring a Kinesis Advantage keyboard (by Damien
  Rajon)](https://25.wf/posts/2020-02-21-qinesis.html)
- [Callum's layout](https://github.com/callum-oakley/keymap)
- [AlaaSaadAbdo's config](https://github.com/AlaaSaadAbdo/zmk-config)
- [rafaelromao keymap](https://github.com/rafaelromao/keyboards)

# TAGS

<!--##tag_list##-->

