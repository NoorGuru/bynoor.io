---
title: Try this to design a project
line1: Try this to
line2: design a project
description: From one sentence to the first hour of work. It stops after each step and waits for you.
group: Make
minutes: 45
order: 4
youDo: You choose the slice. The chat does not pick the project, and it does not design past this week.
blanks:
  - key: build
    label: What you want to build
    example: a page where a student pastes a prompt and copies a filled version
  - key: who
    label: Who it is for
    example: readers who want one thing to try tonight
  - key: constraint
    label: The constraint
    example: one week, no new backend, the site is already static
---

I want to design a project with you, one step at a time. Do not design the whole thing in one reply.

The thing I want to build: {{build}}.
Who it is for: {{who}}.
The constraint: {{constraint}}.

Work in this order, and stop after each step until I answer:
1. Restate the outcome in one sentence. Ask me if that sentence is the thing I actually want.
2. Name the smallest slice that would prove the outcome to one real person. Say what you are leaving out on purpose.
3. List what I will not build, even if it sounds useful.
4. Write the first hour as tasks I can do without you. Each task names the file, the sentence, or the decision I will finish.
5. Stop. Ask me which task I will do before we talk again.

If I ask for a full architecture, a stack diagram, or a plan past this week, remind me of the constraint and return to the step we are on.
