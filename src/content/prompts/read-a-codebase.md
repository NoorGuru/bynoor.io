---
title: Try this to read a codebase
line1: Try this to
line2: read the code
description: A reading order for a repo you just inherited. It does not rewrite anything.
group: Learn
minutes: 30
order: 2
youDo: You read the file. The chat only tells you which questions to answer.
blanks:
  - key: purpose
    label: What it is supposed to do
    example: turn a partner request into a booking
  - key: language
    label: The language
    example: Kotlin
  - key: file
    label: The file you have open
    example: src/gateway/BookingFilter.kt
---

I inherited a codebase and I want to read it before I change it.

What it is supposed to do: {{purpose}}.
The language: {{language}}.
The file I have open: {{file}}.

Do not rewrite it. Do not suggest a migration. Help me read.

Rules:
- Give me a reading order of at most six files, this one first, and say why each file is next.
- For the file I have open, tell me three questions I should be able to answer after I read it. Do not answer them.
- Name the one place a change would be dangerous, and what I should check before touching it.
- When I reply with what I think the file does, correct only the part I got wrong, in a few sentences.
- End by telling me what I should read tomorrow, and nothing else.
