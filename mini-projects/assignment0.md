---
layout: page
title: Assignment 0
permalink: /mini-projects/assignment0
parent: Mini Projects
nav_order: 1
---

# Assignment 0 : Intro to System Calls
Welcome everyone to your very first Assignment in Operating Systems & Networks Course. This assignment is designed to give you a basic introduction to system calls and to give you an idea of what and how you will be working with in the coming Mini Projects.
A system call is a routine that allows a user application to request actions that require special privileges. Adding system calls is one of several ways to extend the functions provided by the kernel.

## GitHub Classroom

For this project, follow [this link](https://classroom.github.com/a/WVXI1UQX) to accept the assignment. You should find a list of roll numbers already available as soon as you click on the link, ensure that you select your roll number correctly as that will mapped to your github id throughout the course. 
You will then be assigned a private repository on GitHub. This is where you will be working on the assignment. All relevant instructions regarding this assignment can be found below.   

> **Note:** If you are not familiar with git, please go through the [git tutorial](https://rogerdudler.github.io/git-guide/) before proceeding.  
> **PS:** Your github id does not need to be with your college id, it can be with your personal email id as well.

## Instructions

This Assignment works as a basic introduction to system calls and to give you an idea of what you will be working with in the coming Mini Projects. It is **highly recommended to go through the Assignment** to make the following Mini Projects easier.

## Overview

This assignment consists of two parts:
1. Creating a file manipulation program that accepts user input and displays file content along with logging.
2. Implementing a process creation program that demonstrates various process API calls.

### Part 1: File Management
Create a C program that does the following:

### **Task Overview**

Write a C program that behaves like a tiny file-based shell. When the program is started, it should:

* **Create a directory named `folder_<pid>`**, where `<pid>` is the process ID of your running program.
* Inside this directory, create two files:

  * `content.txt` — stores all user input
  * `logs.txt` — stores a log of all user interactions

After setup, the program should enter an input loop where it supports the following commands:

---

### **Supported Commands**

> The commands are case-sensitive.

#### `INPUT`

* Prompts the user with `INPUT ->` and accepts a line of text.
* This text is:

  * Appended to `content.txt` in a new line
* Add `INPUT` in `logs.txt`

#### `PRINT`

* Prints the **entire contents of `content.txt`** to the terminal.
* Add `PRINT` in `logs.txt`

#### `FIRST <n>`

* Prints the **first `n` lines** from `content.txt`.
* Add `FIRST <n>` in `logs.txt`

#### `LAST <n>`

* Prints the **last `n` lines** from `content.txt`.
* Add `LAST <n>` in `logs.txt`

#### `STOP`

* Exits the program cleanly.
* Add `STOP` in `logs.txt`

#### `LOG <n>`

* Prints the **`n` lastest logs** from `logs.txt`.
* Do not log this

#### `UNKNOWN COMMAND`

* For any unrecognized input, print `Unknown command.`.
* Do not log this

---

### **Restrictions**

You **must not** use the following functions:

* `fread`, `fwrite`
* `read`, `write`
* `fprintf`, `fscanf`, `fgets`, `fputs`

Instead, you **must** use only:

* `scanf`, `printf` for input and output
---

### **Example Session**

```
Enter command:INPUT
INPUT -> Hello world!
Enter command:INPUT
INPUT -> This is a test.
Enter command:PRINT
Hello world!
This is a test.
Enter command:FIRST 1
Hello world!
Enter command:LAST 1
This is a test.
Enter command:STOP
```

---




## Part 2: Process Creation and Management
Create a C program that does the following:

### **Task 1**
* Define an integer variable `x = 25` in the parent.
* create a child process.
* In the **child**, increment `x` by 10 and print it with its PID.
* In the **parent**, decrement `x` by 5 and print it with its PID.

### **Task 2**

* In the **parent**,  create a child process.
* The **child** should execute an external program (e.g., `./writer`) using `execvp()` or `execlp()`.
* The external program should:

  * Open (or create) a file `newfile.txt`.
  * Write the **parent PID** of the process (i.e., the child’s parent) to the file.
  * Then exit.

**Writer Program (writer.c)** – must be compiled separately

###  **Task 3**

* Create a **child process**.
* The **parent** process should print its PID and terminate before its child.
* The **child** process should sleep for 2 seconds, then print its **own PID** and **parent PID**

---

### 🔍 **Compare Results from Task 2 and Task 3**

Compare:

* The **parent PID written in `newfile.txt`** (from Task 2).
* The **parent PID printed by the child** in Task 3 (after orphaning).

Discuss in README.md:

* Why do they differ?
* What is the role of the init/systemd process?

---

### Additional Notes

* Assume no line exceeds 1024 characters.
* Ensure all resources are freed and closed properly before exiting.
* Do proper error handling 



## Submission

The submission for this assignment will be through GitHub Classroom. The codebase will be automatically downloaded at the deadline, so ensure that everything is up in time. No exceptions will be granted. Include any assumptions or instruction to run in README. 

Assignment-0/  
├── Part-1/  
│   └── fileManagement.c  
├── Part-2/  
│   ├── processManagement.c  
│   └── writer.c  
└── README.md




Hard Deadline : 11:59 PM, 9th August 2025

The course policy regarding **late days is not applicable on Assignment 0**, therefore you cannot use late days with Assignment 0. If you use any AI tools don't forget to follow guidelines in the course website.