---
title: 'svlog - Query Socklog Log Files'
description: 'A tool to query, filter and watch socklog log files on Void Linux'
created: '2023-01-30T17:00:00+01:00'
updated: '2023-01-30T17:00:00+01:00'
tags: ['dev', 'linux']
keywords: ['syslog', 'socklog', 'Linux', 'Void Linux']
---

`svlog` can query, filter and follow socklog log files on Void Linux.

# DESCRIPTION

Efficiently displaying and filtering log files can help identify problems
quickly. Most logging daemons provide mechanisms to dispatch and store the logs
in a user-defined way. However, attempting to create dedicated files for all
kinds of queries seems like the wrong approach, especially as we do not know
what information we need to look up in future. Systemd provides journalctl to
tackle this issue; on non-systemd systems, we are left with `grep`, `sed`,
`awk`, `sort` etc., which can be cumbersome and slow, especially when writing
more complex queries. I wrote `svlog`, a tool to conveniently query and follow
changes of socklog log files on Void providing various display options and
allowing filtering by service, priority, time and content. 

# EXAMPLES

Show all logs which match the regular expression `[A-Za-z]lue.ooth` (case
insensitive) since the last boot and display timestamps in UTC.

``` sh
svlog -m "[A-Za-z]lue.ooth" -i -b --utc
```

Show all kernel logs from the previous boot with priority error or lower (`-o`
is currently only support on systems using the *GNU C Library* [[1]] as *musl
libc* [[2]] does not support *wtmp*).

``` sh
svlog -o 1 -p ..err kernel
```

Show all kernel and daemon logs as of a certain timestamp until yesterday.

``` sh
svlog -s "2022-08-14 13:45" -u yesterday kernel daemon
```

Show the last 10 lines and all upcoming kernel logs (like `svlogtail`).

``` sh
svlog -f kernel
```

# SOURCE CODE

[github.com/pascal-huber/svlog](https://github.com/pascal-huber/svlog)

# TAGS

<!--##tag_list##-->

[1]: https://www.gnu.org/software/libc/ 
[2]: https://musl.libc.org/