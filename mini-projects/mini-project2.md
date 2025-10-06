---
layout: page
title: Mini Project 2
permalink: /mini-projects/mini-project2
parent: Mini Projects
nav_order: 2
---


# *The LAZY Corp Trilogy*

Welcome to **LAZY Corp**, the world’s least efficient tech giant. They run on unpaid interns, overworked managers, and “innovations” designed mainly to cut corners. This semester, *you* have been recruited as part of their **Experimental Systems Division**, where they test new half-baked ideas on gullible interns (that’s you).

LAZY Corp has three subsidiaries, each with its own mess to clean up:

1. **PagedOut Inc.** – They run memory like an office with too few desks. Your job is to manage “demand paging” and evict old pages into dusty storage lockers (swap).
2. **C-Shark Division** – They call this the “Security Department,” but really it’s just interns peeking into packets like nosy neighbors. Your mission is to sniff, dissect, and log every suspicious bit flying through the network.
3. **ThreadForce Ops** – The “Operations Unit” where chaos reigns. Multiple interns fight over the same resources (printers, coffee machines, whiteboards). You must enforce order with locks and condition variables before the office deadlocks.

Together, these missions form: **The LAZY Corp Trilogy: Memory, Packets, and Mayhem.**

 

# Instructions

Please read the following instructions carefully before starting your work.  
Failure to follow them may result in penalties or a **zero score** in the assignment.


## 1. General Rules
- **Deadline Policy:**  
  - No doubts will be answered in the **last week before the deadline**. 
  - You are required to accept the **GitHub Classroom invitation** immediately. Any request to accept the repository after **10 days** will not be considered.
- **Doubt Policy:**  
  - Read through the requirements thoroughly **before asking doubts**.
  - No repetitive questions will be entertained.  
  - You are expected to **Google or use GPT** for basic concepts. 
  - **No project-related queries** will be answered outside HackMD.  
- **Code Testing:**  
  - Make sure to **thoroughly test your code** before submission to avoid runtime errors or unexpected behavior.  
- **Late Submission Policy:**  
  - Attempts to bypass GitHub Classroom deadlines (using hacks, backdating commits, etc.) will result in a **straight zero**.  


## 2. AI Tools Usage (Mandatory if Applicable)
We are aware of how easy it is to use LLM services (ChatGPT, Gemini, Claude, etc.). If you use them:

- Clearly **mark LLM-generated code** as below:

  ```text
  ############## LLM Generated Code Begins ##############
  some llm generated code
  ############## LLM Generated Code Ends ################
  ```
* Provide the **exact prompts and LLM responses** as image files in a folder called `llm_completions/`.
* You must also:

  * Be able to explain **every part of the code** during in-person evaluation.
  * Briefly explain how you **modified or verified** the AI-generated content.
  * Submit a **shareable link or screenshot** of the AI Tool conversation.
  * ⚠️ Do NOT share private or sensitive personal information.

If you fail to explain any part of the code, it will be considered **plagiarized** and you will be penalized.


## 3. Notes Regarding Grading

* The assignment has **three parts** with below given weights to overall course total:

  * Part A — 50%
  * Part B — 30%
  * Part C — 20%
* **Evaluation Process:**

  * In-person evaluation will hold **more weightage** than code/automated evaluation.
  * Automated evaluation will strictly check for **correct input/output formats**.
  * Any deviation from specified formats will likely result in **zero score**.


---
<br>

# Part A — PagedOut Inc. (110 Marks)

> 🎉 **Welcome, Intern!**  
> You’ve been assigned to **PagedOut Inc.**, a newly formed subsidiary of **LAZY Corp**, dedicated to cutting costs by doing as little work as possible — but with lots of paperwork to prove we’re *“efficient.”*  
>
> Here’s the deal: xv6 currently behaves like an **overenthusiastic intern**. Whenever a process asks for memory, xv6 rushes to allocate everything up front — even if the process never uses half of it. That’s wasteful, and here at **PagedOut Inc.**, waste is unacceptable (unless it’s unpaid intern time).  
>
> Our revolutionary philosophy: **why allocate memory until we absolutely must?** Instead of giving processes **desks (pages)** the moment they join, we’ll make them **stand in the hallway** until they actually need one. If the **office (physical memory)** runs out of desks, we’ll wheel out the **oldest one to the dusty basement archive (swap).**  
>


## Goals

You will implement:

* **Demand Paging (Lazy Allocation):** Don’t give memory until a process actually accesses it.
* **Page Fault Handling:** When a process touches a missing page, service the “incident report.”
* **FIFO Page Replacement:** When memory is full, evict the oldest resident page.
* **Per-Process Swap Area:** Each process maintains its own private locker for evicted pages.



## Corporate Rules & Clarifications

Think of this as the **PagedOut employee handbook**:

* **Page Size:** 4096 bytes. All logged addresses must be page-aligned, lowercase hex with `0x` prefix.
* **When to Replace:** Eviction happens only if the system has *no free frames* (`kalloc()` fails).
* **Victim Scope:** Each process may only evict its *own* resident pages.
* **FIFO Policy:** Track pages with a per-process sequence number. Oldest (lowest seq) is always evicted first.
* **Valid vs Invalid Access:**

  * **Valid:** within text/data loaded by `exec`, within heap (≤ `proc->sz`), within stack (≤ one page below SP), or a page that was swapped.
  * **Invalid:** anything else. The process is *terminated cleanly* with a log.
* **Per-Process Swap File:**

  * Path: `/pgswpXXXXX` (PID-based).
  * Created on `exec`, deleted on process exit.
  * No sharing between processes.
* **Swap Capacity:** Max 1024 pages (4 MB) per process. If full when a dirty eviction is required → process terminated.
* **Dirty Tracking:** A page is dirty if written since being brought in. Software tracking permitted (e.g., trap on first write).
* **Logging:** Every action is logged to the xv6 console (`cprintf`), **one line per event**, in exact formats below.




## 1. Demand Paging (40 Marks)

**Specification**

* At process startup (`exec`), do **not** pre-allocate or load all program pages. **[10 Marks]**
* On `sbrk`, **do not** allocate physical pages immediately; only adjust `proc->sz`. **[5 Marks]**
* When a process first accesses an unmapped virtual page, a **page fault** must occur. **[5 Marks]**
* The page fault handler must allocate or load the missing page:

  * **Text/Data segments:** Load the correct page contents from the program executable on demand. **[10 Marks]**
  * **Heap (`sbrk`):** Allocate a **zero-filled** page on first access. **[5 Marks]**
  * **Stack:** Allocate a **zero-filled** page if the faulting address is within **one page below** the current stack pointer. **[5 Marks]**
* If the faulting address lies **outside** valid code/data/heap/stack ranges, the process must be **terminated with an error log** (see logging). **[5 Marks]**

**Logging Requirement (see full formats below)**

* Log each page fault with **access type** and **cause/source**.
* Log allocation (`ALLOC`) for zero-filled pages.
* Log executable loads (`LOADEXEC`) for text/data.
* After any page becomes resident (ALLOC/LOADEXEC/SWAPIN), emit a `RESIDENT` record with a **per-process FIFO sequence number**.



## 2. Page Replacement (30 Marks)

**Specification**

* Maintain the **resident set per process**. **[5 Marks]**
* Replacement is triggered **only** when `kalloc()` fails (system out of frames). **[5 Marks]**
* The faulting process must select a **victim from its own resident set** using **FIFO** (oldest resident page first). **[10 Marks]**
* No process may evict another process’s page. **[5 Marks]**
* Correctly handle FIFO sequence numbers and wraparound. **[5 Marks]**

**Logging Requirement**

* When memory is full and replacement begins, log `MEMFULL`.
* When a victim is chosen, log `VICTIM` including the resident page’s **FIFO sequence number**.
* Always log `EVICT` stating whether the page is **clean** (discarded) or **dirty** (will be swapped out).



## 3. Swapping (35 Marks)

**Specification**

* **Per-Process Swap Area [8 Marks]**  
  - Each process must have its own swap file in the root directory, named uniquely (e.g., `/pgswp00023`).  
  - Created during `exec()` and deleted on process exit.  
  - No sharing or reuse between processes.  
  - Swap file uses regular disk blocks (no dedicated partition required).  

* **Eviction and Swap Management [17 Marks]**
  - A page must always have a valid copy of its contents — either in memory, in the executable file, or in the process’s swap file.
  - Clean pages may be discarded only if a valid backing copy already exists **[5 Marks]**
  - Dirty pages, or pages that no longer have a valid backing copy, must be written to the process’s swap file. **[5 Marks]**
  - Track free/used slots; free a slot when a page is reloaded **[4 Marks]**  
  - Each slot is **page-sized** (4096 bytes).  
  - Max swap capacity: 1024 pages (4 MB).  
  - If a dirty eviction is required and no free slot exists → terminate process with an error log **[3 Marks]**  
  - Pages in swap may be loaded back only by the owning process.  
  - Do **not overwrite** occupied slots.  

* **Reloading Pages from Swap [10 Marks]**  
  - On page fault to a previously swapped-out page, reload it from the process’s swap file and map it into memory.  
  - Update the resident set and FIFO sequence.  
  - Free the corresponding swap slot after reload.  
  - Logging required: `SWAPIN` with virtual address and slot number.  
  - Process must continue execution correctly after reload.


**Logging Requirement**

* Log `SWAPOUT` with the **slot number** for dirty evictions.
* Log `SWAPIN` with the **slot number** when reloading.
* Log `SWAPFULL` before terminating a process due to lack of swap slots.
* On process exit, log `SWAPCLEANUP` with the **number of slots reclaimed**.

## 4. System State Inspection (5 Marks)

To allow for robust testing and grading, you must implement a system call that exposes
the internal state of a process’s virtual memory.

### Specification

- Create a new system call:
  ```c
  int memstat(struct proc_mem_stat *info);
  ```
This syscall fills a user-provided `proc_mem_stat` structure with the memory status of the calling process.

Define the required data structures in a new header (e.g., memstat.h).

### **Data Structures**
```c
// In memstat.h

#define MAX_PAGES_INFO 128 // Max pages to report per syscall

// Page states
#define UNMAPPED 0 
#define RESIDENT 1 
#define SWAPPED  2

struct page_stat {
  uint va;    
  int state;  
  int is_dirty; 
  int seq;     
  int swap_slot; 
};

struct proc_mem_stat {
  int pid;
  int num_pages_total;     
  int num_resident_pages; 
  int num_swapped_pages;   
  int next_fifo_seq;       
  struct page_stat pages[MAX_PAGES_INFO];
};
```
### Implementation Notes  
- `num_pages_total` = all virtual pages between program start and `proc->sz`,
including resident, swapped, and reserved/unmapped pages.

- A newly allocated or loaded page starts with `is_dirty` = 0.
The kernel must set `is_dirty` = 1 when the page is written.

- If the process has more than `MAX_PAGES_INFO` pages, only the lowest-address
pages are reported. Test cases will not exceed this limit.

- Swap slot IDs must be consistent across `SWAPOUT` and `SWAPIN` operations.

- `seq` must increase monotonically within a process, regardless of swaps.



## Mandatory Logging Formats

Auditors at PagedOut Inc. insist on exact paperwork. Use **only these formats** — no extra text.

### Initialization

```
[pid X] INIT-LAZYMAP text=[0xA,0xB) data=[0xC,0xD) heap_start=0xE stack_top=0xF
```

### Page Fault (always first on a fault)

```
[pid X] PAGEFAULT va=0xV access=<read|write|exec> cause=<heap|stack|exec|swap>
```

### Bringing a Page Resident

```
[pid X] ALLOC va=0xV
[pid X] LOADEXEC va=0xV
[pid X] SWAPIN va=0xV slot=N
[pid X] RESIDENT va=0xV seq=S
```

### Memory Full & Replacement

```
[pid X] MEMFULL
[pid X] VICTIM va=0xV seq=S algo=FIFO
[pid X] EVICT  va=0xV state=<clean|dirty>
```

If clean:

```
[pid X] DISCARD va=0xV
```

If dirty:

```
[pid X] SWAPOUT va=0xV slot=N
```

### Invalid Access & Termination

```
[pid X] KILL invalid-access va=0xV access=<read|write|exec>
```

### Swap Capacity Failure

```
[pid X] SWAPFULL
[pid X] KILL swap-exhausted
```

### Process Exit Cleanup

```
[pid X] SWAPCLEANUP freed_slots=K
```



## Event Ordering Guarantees

Every fault must follow these exact corporate-approved flowcharts:

* **Heap/Stack allocation:**
  `PAGEFAULT → ALLOC → RESIDENT`

* **Executable page:**
  `PAGEFAULT → LOADEXEC → RESIDENT`

* **Swapped page:**
  `PAGEFAULT → SWAPIN → RESIDENT`

* **Replacement path (no free frames):**
  `PAGEFAULT → MEMFULL → VICTIM → EVICT → (DISCARD | SWAPOUT) → (ALLOC|LOADEXEC|SWAPIN) → RESIDENT`

* **Invalid access:**
  `PAGEFAULT → KILL invalid-access`

* **Swap full:**
  `PAGEFAULT → MEMFULL → VICTIM → EVICT state=dirty → SWAPFULL → KILL swap-exhausted`

## Bonus: Alternative Page Replacement (15 Marks)

**Specification**

* Implement **one additional page replacement algorithm** of your choice to replace pages when memory is full.  
* Your design **does not need to follow a specific existing policy** (e.g., NRU, Clock, Aging, or any standard) — you can innovate.  
* Ensure your algorithm works correctly in a **multi-process environment**:  
  - Only evict pages from the faulting process’s resident set.  
  - Respect dirty/clean page handling (dirty → swap, clean → discard).  

**Documentation Requirement**

* In your project README or report, include:  
  - **Algorithm Description:** Explain what your replacement strategy does.  
  - **Design Rationale:** Why you chose this approach, its advantages, and trade-offs.  
  - **Implementation Details:** How you track pages, select victims, and handle edge cases.  

**Logging Requirement**

* When using your custom algorithm:  
  - Log the event of memory being full (`MEMFULL`).  
  - Log victim selection (`VICTIM`) including page address and any relevant metadata.  
  - Log eviction outcome (`EVICT`) stating whether the page is clean or dirty.  

**Notes**

* This is **bonus work**: correct implementation and documentation are required to earn the 10 marks.  
* Marks will be awarded for both **functionality** and **clarity of explanation**.
* Marks breakdown:
  - Correct implementation and behavior: 12 Marks  
  - Documentation and explanation: 3 Marks  


## Deliverables

* Modified xv6 kernel source implementing demand paging + swapping.
* Console logs must exactly match formats above.

### Notes :

* All required logging must be implemented **faithfully**. If logs are missing, incomplete, misleading, or faked, you will receive **zero marks**.

* The `memstat()` system call is **non-negotiable**. If you fail to implement it, your work for this part will not be evaluated at all, and you will receive **0 marks**.

* Your implementation must maintain **internal bookkeeping** such that `memstat()` reports **consistent** and **truthful** data.

<br>


> 🎉 **Congratulations, Intern!**  
> If you finish **Part A**, xv6 will officially graduate from *“wasteful”* to *“corporately lazy.”* But don’t get comfortable — rumor has it **LAZY Corp’s Wi-Fi has been compromised.**  
>
> Your next posting is in the **C-Shark Division**, where the packets are fishy and the security budget is nonexistent.  

---

# Part B — The Terminal Packet Sniffer  

> 🦈 **Welcome to the C-Shark Division!**  
> This is **LAZY Corp’s** idea of a cybersecurity team. Forget expensive firewalls or fancy monitoring tools — you’ll be handed a **terminal-based shark fin** and told to sniff out suspicious packets.  
Your task is to build C-Shark, a terminal-only sniffer that LAZY Corp swears is “just as good as Wireshark” (legal says we have to stop calling it “diet Wireshark”). With it, you’ll see everything flowing through the network: shady MAC addresses, questionable IP headers, and DNS queries that definitely don’t look work-related.  
Think of it as giving you x-ray specs for the internet, only instead of superheroes, you’re an underpaid intern staring at hex dumps.

## Your Arsenal & The Rules of Engagement

Before we begin our expedition into the network stream, let's go over your toolkit and some ground
rules.

**Your Primary Weapon: libpcap** 
The core of our sniffer will be built using the pcap library.
You'll need to include pcap.h. You are also encouraged to use the standard C networking
libraries to decode the packet headers.

```c
#include <pcap.h>
#include <net/ethernet.h>
#include <netinet/ip.h>
#include <netinet/ip6.h>
#include <netinet/tcp.h>
#include <netinet/udp.h>
#include <netinet/ip_icmp.h>
#include <net/if_arp.h>
#include <arpa/inet.h>
```

**Creative Freedom:** The example input/output formats shown below are just that—examples!
You have the freedom to design your own interface, as long as all the required functionality is
present and the output is clear and readable.

**Reconnaissance is Key:** It is highly recommended to read through all the project phases
before writing a single line of code. A good plan will help you structure your code in a modular
and expandable way from the very beginning.

**Choosing Your Hunting Ground:** College Wi-Fi or corporate LANs can have complex
configurations (it will and should still work on it, but the packets on there may be less predictable). 
For easier debugging, it's a great idea to use your own personal hotspot. The
packets will be much more predictable! Even if you don't have hotspot connection, you can set up and
try to debug using localhost (`lo` interface - a localserver) for testing purposes.

**Root Privileges Required:** Packet sniffing requires deep access to the network stack. You
will need to run your final executable with sudo for it to work.

```bash
sudo ./cshark
```

**A Shark, Not a Kraken:** Remember your role. You are a silent predator, observing from the depths.
Your job is to watch the traffic flow by, not to thrash about and create a tidal wave. C-Shark is a *listener*, not a talker. 
You are strictly forbidden from sending, injecting, or crafting packets. LAZY Corp’s legal team has a very small budget,
and they don’t want to spend it bailing you out for taking down the campus Wi-Fi. Observe only.

And when the big day comes, **keep [Wireshark](https://www.wireshark.org/download.html) handy** – it's your official 'reality check' to ensure your sniffer isn't just making things up. That is have wireshark downloaded and setup on your system during the evals.

## Phase 1: Setting the Hook - Interface & Basic Capture

Our first step is to set up the sniffer, find the right place to listen, and start catching our first packets.

### Task 1.1: Device Discovery [3]

As soon as your program launches, it must scan for all available network interfaces on the machine
and present them to the user in a numbered list. The user should be able to select an interface to
monitor.

**Example Output:**
```
[C-Shark] The Command-Line Packet Predator
==============================================
[C-Shark] Searching for available interfaces... Found!

1. wlan0
2. any (Pseudo-device that captures on all interfaces)
3. lo
4. docker0
5. bluetooth0 (Bluetooth adapter number 0)
6. bluetooth-monitor (Bluetooth Linux Monitor)
7. nflog (Linux netfilter log (NFLOG) interface)
8. nfqueue (Linux netfilter queue (NFQUEUE) interface)
9. dbus-system (D-Bus system bus)
10. dbus-session (D-Bus session bus)

Select an interface to sniff (1-10):
```

### Task 1.2: The Main Menu & First Catch [2]

After the user selects an interface, they should be presented with the main menu. For this phase, you
only need to implement the first option.

**Main Menu:**
```
[C-Shark] Interface 'wlan0' selected. What's next?

1. Start Sniffing (All Packets)
2. Start Sniffing (With Filters) <-- To be implemented later
3. Inspect Last Session <-- To be implemented later
4. Exit C-Shark
```

**Sniffing All Packets:** When the user selects this, the program will start capturing and
displaying a live feed of all packets on the chosen interface. For each packet, display:

- A unique Packet ID (e.g., starting from 1).
- The packet's timestamp.
- The captured length of the packet in bytes.
- The first 16 raw bytes of the packet frame in hexadecimal format.

**Graceful Controls:**
- **Ctrl+C**: This should not terminate the program. Instead, it should stop the live
capture and return the user to the main menu.
- **Ctrl+D**: This should be the universal "get me out of here" command, exiting the
application cleanly from any point.

## Phase 2: The Deep Dive - Layer-by-Layer Dissection [15]

Now that we can catch packets, it's time to learn what's inside them. In this phase, we will enhance
our packet display to decode information layer by layer. You can now replace the raw 16-byte hex
dump with this more detailed analysis.

### Task 2.1: The Data Link Dance (Layer 2) [3]

Decode the Ethernet header. For each packet, along with the existing info (ID, timestamp, length),
display:

- Source MAC Address
- Destination MAC Address
- EtherType: Identify if the payload is IPv4, IPv6, ARP, or "unknown" (you need not identify
other types).

**Example Output:**
```
-----------------------------------------
Packet #1113 | Timestamp: 1757370992.553060 | Length: 66 bytes
L2 (Ethernet): Dst MAC: E6:51:4A:2D:B0:F9 | Src MAC: B4:8C:9D:5D:86:A1 |
EtherType: IPv4 (0x0800)
```

### Task 2.2: Navigating the Network Maze (Layer 3) [4]

Based on the EtherType from Layer 2, decode the network layer packet. You must support IPv4, IPv6,
and ARP.

**For IPv4:** Display Source IP, Destination IP, Protocol (TCP, UDP, need to be identified, rest
unknown is fine), TTL, Packet ID, Total Length, Header Length, and any Flags (aptly decoded).

**For IPv6:** Display Source IP, Destination IP, Next Header (identifying TCP/UDP, and can skip
the rest), Hop Limit, Traffic Class, Flow Label, and Payload Length.

**For ARP:** Display Operation (not just the number, the apt decoding), Sender & Target IP and
MAC addresses, and other relevant fields like Hardware Type/Length and Protocol Type/Length
(need not be decoded).

**Example Outputs:**
```
-----------------------------------------
Packet #8 | Timestamp: 1757371843.428270 | Length: 66 bytes
L2 (Ethernet): Dst MAC: B4:8C:9D:5D:86:A1 | Src MAC: 00:1D:45:55:2C:3F |
EtherType: IPv4 (0x0800)
L3 (IPv4): Src IP: 34.107.221.82 | Dst IP: 10.2.130.118 | Protocol: TCP (6) |
TTL: 118
ID: 0xA664 | Total Length: 52 | Header Length: 20 bytes
-----------------------------------------
Packet #9 | Timestamp: 1757371843.447261 | Length: 60 bytes
L2 (Ethernet): Dst MAC: FF:FF:FF:FF:FF:FF | Src MAC: 00:1D:45:55:2C:3F |
EtherType: ARP (0x0806)

L3 (ARP): Operation: Request (1) | Sender IP: 10.2.128.1 | Target IP:
10.2.138.236
Sender MAC: 00:1D:45:55:2C:3F | Target MAC: 00:00:00:00:00:00
HW Type: 1 | Proto Type: 0x0800 | HW Len: 6 | Proto Len: 4
-----------------------------------------
Packet #1158 | Timestamp: 1757370992.826139 | Length: 602 bytes
L2 (Ethernet): Dst MAC: E6:51:4A:2D:B0:F9 | Src MAC: B4:8C:9D:5D:86:A1 |
EtherType: IPv6 (0x86DD)
L3 (IPv6): Src IP: 2409:40f0:d6:d3c9:325b:75d4:4a4a:98e | Dst IP:
2404:6800:4007:83d::200a
Next Header: TCP (6) | Hop Limit: 64 | Traffic Class: 0 | Flow
Label: 0x00000 | Payload Length: 548
```

### Task 2.3: Unpacking the Cargo (Layer 4) [4]

Based on the protocol from Layer 3, decode the transport layer segment. You must support TCP and
UDP.

**For TCP:** Display Source & Destination Ports (and identify common ones like http, https, dns,
in particular), Sequence Number, Acknowledgement Number, Flags (decoded, e.g., [SYN,
ACK]), Window Size, Checksum, and Header Length.

**For UDP:** Display Source & Destination Ports (same as TCP), Length, and Checksum.

**Example Outputs:**
```
-----------------------------------------
Packet #1139 | Timestamp: 1757370992.785491 | Length: 136 bytes
L2 (Ethernet): Dst MAC: B4:8C:9D:5D:86:A1 | Src MAC: E6:51:4A:2D:B0:F9 |
EtherType: IPv6 (0x86DD)
L3 (IPv6): Src IP: 2409:40f0:d6:d3c9::5a | Dst IP:
2409:40f0:d6:d3c9:325b:75d4:4a4a:98e | Next Header: UDP (17) | Hop Limit: 64
Traffic Class: 0 | Flow Label: 0x00000 | Payload Length: 82
L4 (UDP): Src Port: 53 (DNS) | Dst Port: 45971 | Length: 82 | Checksum:
0x1A99
-----------------------------------------
Packet #1140 | Timestamp: 1757370992.786104 | Length: 94 bytes
L2 (Ethernet): Dst MAC: E6:51:4A:2D:B0:F9 | Src MAC: B4:8C:9D:5D:86:A1 |
EtherType: IPv6 (0x86DD)
L3 (IPv6): Src IP: 2409:40f0:d6:d3c9:325b:75d4:4a4a:98e | Dst IP:
2404:6800:4007:83d::200a | Next Header: TCP (6) | Hop Limit: 64
Traffic Class: 0 | Flow Label: 0x00000 | Payload Length: 40
L4 (TCP): Src Port: 35554 | Dst Port: 443 (HTTPS) | Seq: 4016914192 | Ack: 0
| Flags: [SYN]
Window: 64800 | Checksum: 0x804D | Header Length: 40 bytes
```

### Task 2.4: Inspecting the Contents (Layer 7 / Payload) [4]

Finally, let's peek at the actual data.

**Identify Application Protocol:** Based on the port numbers, identify common protocols like
HTTP, HTTPS, and DNS. For others, you can label them "Unknown".

**Display Payload:** Show the length of the payload. And, you must display the first 64 bytes of
the payload in a combined hex and ASCII format (a "hex dump" - this format is mandatory).

**Example Outputs:**
```
-----------------------------------------
Packet #1130 | Timestamp: 1757370992.568192 | Length: 179 bytes
L2 (Ethernet): Dst MAC: E6:51:4A:2D:B0:F9 | Src MAC: B4:8C:9D:5D:86:A1 |
EtherType: IPv6 (0x86DD)
L3 (IPv6): Src IP: 2409:40f0:d6:d3c9:325b:75d4:4a4a:98e | Dst IP:
64:ff9b::3694:bd7c | Next Header: TCP (6) | Hop Limit: 64
Traffic Class: 0 | Flow Label: 0x00000 | Payload Length: 125
L4 (TCP): Src Port: 50478 | Dst Port: 443 (HTTPS) | Seq: 4154012307 | Ack:
1490828286 | Flags: [ACK,PSH]
Window: 510 | Checksum: 0x32FA | Header Length: 32 bytes
L7 (Payload): Identified as HTTPS/TLS on port 443 - 93 bytes
Data (first 64 bytes):
16 03 03 00 25 10 00 00 21 20 A3 F9 BF D4 D4 6C ....%...! .....l
CC 8F CC E8 61 9C 93 F0 09 1A DB A7 F0 41 BF 78 ....a........A.x
01 23 86 B2 08 F0 CB 11 12 36 14 03 03 00 01 01 .#.......6......
16 03 03 00 28 00 00 00 00 00 00 00 00 5E B6 F2 ....(........^..
-----------------------------------------
Packet #1133 | Timestamp: 1757370992.710760 | Length: 108 bytes
L2 (Ethernet): Dst MAC: E6:51:4A:2D:B0:F9 | Src MAC: B4:8C:9D:5D:86:A1 |
EtherType: IPv6 (0x86DD)
L3 (IPv6): Src IP: 2409:40f0:d6:d3c9:325b:75d4:4a4a:98e | Dst IP:
2409:40f0:d6:d3c9::5a | Next Header: UDP (17) | Hop Limit: 64
Traffic Class: 0 | Flow Label: 0x00000 | Payload Length: 54
L4 (UDP): Src Port: 52556 | Dst Port: 53 (DNS) | Length: 54 | Checksum:
0xB6D0
L7 (Payload): Identified as DNS on port 53 - 46 bytes
Data (first 46 bytes):
E5 52 01 00 00 01 00 00 00 00 00 00 08 74 61 73 .R...........tas
6B 73 2D 70 61 08 63 6C 69 65 6E 74 73 36 06 67 ks-pa.clients6.g
6F 6F 67 6C 65 03 63 6F 6D 00 00 41 00 01       oogle.com..A..
```

## Phase 3: Precision Hunting - Filtering the Stream [2]

Implement the second option in the main menu: Start Sniffing (With Filters). When the user
selects this, they should be able to apply a filter to see only the packets they care about. You must
support filtering by the following protocols:

- HTTP
- HTTPS
- DNS
- ARP
- TCP
- UDP

## Phase 4: The Packet Aquarium - Saving Your Catch [2]

A good detective keeps records. Your application must store the packets captured during the most
recent sniffing session (whether filtered or not).

**Storage:** You are free to decide how to store them(presistance not mandatory).

**Capacity:** Define a macro for the maximum number of packets to store (e.g., #define
MAX_PACKETS 10000).

**Memory Management:** C-Shark must only store packets from the last session. When a new
sniffing session starts, you must free any memory allocated for the previous session to prevent
memory leaks(if any). If the user tries to inspect a session when none has been run yet,
display an appropriate error message.

## Phase 5: The Digital Forensics Lab - In-Depth Inspection [6]

It's time to put a single packet under the microscope. Implement the third option in the main menu:
Inspect Last Session.

**Selection:** The program should list the summary of all stored packets from the last session
(ID, timestamp, length, basic L3/L4 info). The user can then enter a Packet ID to inspect it
more closely.

**In-Depth Analysis:** The output for the selected packet must be a comprehensive breakdown.
For every supported layer, you must show both the raw hexadecimal values and their
human-readable interpretation. The entire packet frame must also be displayed in a full
hex dump (a "hex dump" must be present). And even the payload if applicable. Here's an example of how the output might [look](https://postimg.cc/gallery/VfHVg5L) (just an example,
you can design your own format, what to put, what not to put as long as the basic minimum requirements are met
...the example has a couple of extra and missing things).

## Submission Format

Your project should be submitted with a Makefile. Running make should compile your source code
and produce an executable. The program should be runnable via:

```bash
make
sudo ./cshark
```


> 🕵️ **Well done, Detective.**
>
> You’ve sniffed packets, logged headers, and maybe even stopped Dave from streaming soap operas on company Wi-Fi.
>
> But your work isn’t done. The final challenge awaits in **ThreadForce Ops**, where you’ll have to manage interns running amok in parallel. One wrong move, and the entire office will **deadlock — literally.**

---

# Part C — Fighting for the resources (20 Marks)


A office bakery has four ovens, four chefs, and a waiting area that can accommodate four customers on a sofa waiting for their cake to be baked and that has standing room for additional customers. As the office bakery is a new one and small scale, it is limited to accommodate 25 customers. A customer will not enter the office bakery if it is filled to capacity with other customers.

Once inside, the customer takes a seat on the sofa or stands if the sofa is filled. When a chef is free, the customer that has been on the sofa the longest is served and, if there are any standing customers, the one that has been in the shop the longest takes a seat on the sofa.

When a customer’s cake is finished, any chef can accept payment, but because there is only one cash register, payment is accepted for one customer at a time. There is no separate staff as this a small office bakery. Chefs handle payment and also bake the cakes. Chefs divide their time among baking cakes, accepting payment, and learning new recipes while waiting for a customer.

In other words to make the question clear, the following  constraints apply:
- Customers on arriving the office bakery invoke the following functions in order: enteroffice bakery, sitOnSofa, getcake, pay.
- Chefs invoke bakecake and acceptPayment. They should prioritise taking money over baking cake.
- Customers cannot invoke enterofficebakery if the shop is at capacity.
- If the sofa is full, an arriving customer cannot invoke sitOnSofa.
- When a customer invokes getcake there should be a corresponding chef executing bakecake concurrently, and vice versa.
- It should be possible for up to four customers to execute get cake concurrently, and up to four chefs to execute bakecake concurrently.
- The customer has to pay before the chef can acceptPayment.
- The chef must acceptPayment before the customer can exit. Chefs ids are 1,2,3,4 Note: Take every action which customer performs takes 1 second. That means Customer entering to sitting in sofa takes 1 second. But chef’s action baking cake and accepting payment takes 2 seconds.
- Once the customer sits on sofa, the seat is reserved for him till he leaves after the payment.
- Any action cannot be split. If a person initiated an action, he should continue till he is done. For example, chef should give 2 seconds for payment. He cannot split it.

## Input :

```
<time_stamp> Customer <id>
you should accept customers till a <EOF> flag.
```
Example :
```
1 Customer 254367

2 Customer 24568

3 Customer 123456

<EOF>
```

## Output :
```
<time_stamp> <Customer/Chef> <id> <actions>
```

Customer actions enters/sits/requests cake/pays/leaves 

Chef actions bakes/accept payments.

you don’t need to print chef learning new recipes

#### Note: As this is a multithreading assignment, you should use threads. Each of the chef is a thread and each of customer is another thread.

---

# Submission Format:

Your repository must strictly follow the strcutre given below, failure to do so would lead the autograder to fail and requests for wrong submission format shall not be entertained.

You shall directly have this submission format in your repository when you sync fork the repository (which means that this submission format is directly given by default in the starter template code), so you need not worry about it.

```
your_repo
├── A
│   ├── kernel/
│   ├── LICENSE
│   ├── Makefile
│   ├── mkfs/
│   ├── README
│   ├── test-xv6.py
│   └── user/
├── B
│   ├── Makefile
│   └── README.md
│   └── *.c files
│   └── *.h files
└── C
    └── *.c file
    └── README.md

```
`*` indicating you are free to name the file or files whatever you want.

---

> If you’ve made it this far, congratulations — you’ve survived the full **LAZY Corp Trilogy**. You’ve kept memory lazy, sniffed out network chaos, and juggled concurrency disasters. Consider yourself promoted… to unpaid senior intern.


---
