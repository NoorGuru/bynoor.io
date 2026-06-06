---
title: "Technical Interview Preparation Kit"
draft: false
showToc: true
description: I used to have some cheat sheets around to prepare myself for any incoming technical interview, then I thought it would be a better idea to gather them here for quicker access.
date: 2021-06-13
slug: technical-interview-preparation-kit
---
_Updated on Sep 7th, 2023_


# Introduction
I used to have some cheat sheets around to prepare myself for any incoming technical interviews, so I thought it would be a better idea to gather them here for quicker access.
It could help someone else to prepare quickly as well :)

>The order might not be so relevant. Pick and choose what you need to review.

---

# Long-Term Preparation Kit

If I can afford only one book to prepare for my technical interviews, I will definitely buy the [Cracking the Coding Interview](https://www.crackingthecodinginterview.com) book by Gayle McDowell, 6th edition.
That's it, good luck!

## Before You Continue
> Check my new presentation on [Cracking the Tech Job Interview](https://present.bynoor.io/tech-interview/) to get a better understanding of the technical interview process, and what you can do to prepare for it - on the technical and non-technical sides.


---

# Learn by Practice
If you prefer to learn by practising, I would advise you to start with Hackerank Preparation Kits.

## Practice per Topic

[The HackerRank Interview Preparation Kit](https://www.hackerrank.com/interview/interview-preparation-kit)

**Recommended** if you are a beginner or you need a refresher on a certain topic.

## Practice on a Schedule

[Interview Preparation Kits](https://www.hackerrank.com/interview/preparation-kits)

**Recommended** if you have a scheduled interview, and you need to refresh your skills in different topics.



- [3 Months Preparation Kit](https://www.hackerrank.com/interview/preparation-kits/three-month-preparation-kit/three-month-week-one/challenges)
- [1 Month Preparation Kit](https://www.hackerrank.com/interview/preparation-kits/one-month-preparation-kit/one-month-week-one/challenges)
- [1 Week Preparation Kit](https://www.hackerrank.com/interview/preparation-kits/one-week-preparation-kit/one-week-day-one/challenges)
- **1 Day Preparation Kit?** Continue reading this article.

---

# Short-Term Preparation Kit

If I don't have a long time to prepare, or if I already went through the long-term preparation kit before, and I want a quick refresh, I would follow this kit.
Multiple resources and steps already summarize some topics from the Cracking the Coding Interview book I referred to above, with few modifications.

**Video Kit:**
If I have a little more time, I would go through [this playlist](https://www.youtube.com/playlist?list=PLOuZYwbmgZWXvkghUyMLdI90IwxbNCiWK) first, at least once.

---

## Keep in Mind

Keep these data structures, algorithms, and concepts in mind:

- Data Structures:
    1. Linked Lists
    1. Trees, Tries, and Graphs
    1. Stacks and Queues
    1. Heaps
    1. Vectors and Array Lists
    1. **>> Hash Tables <<** (Dictionaries, Maps, ...)
    
- Algorithms:
    1. Breadth-First Search
    1. Depth-First Search
    1. Binary Search
    1. Merge Sort
    1. Quick Sort
    
- Concepts:
    1. Memory (Stacks VS Heaps)
    1. Recursion
    1. Dynamic Programming
    1. Big O Time & Space
    1. Bit Manipulation


---

## 7 Steps to Solve Algorithm Problems

1. Listen (& ask!).

1. Pick an example which is:
    1. Big (enough)
    1. Is not a special case 

1. Use a brute-force approach (at least to think of the problem).

1. Optimize your solution.

1. Walk through your algorithm and know exactly what you are going to do before starting to code, think of needed variables and data structures for instance.

1. Code! Make sure to have a:
    1. (Consistent) code style: Use descriptive variable names, and you may refer to them with abbreviations later.
    1. Modular code: before coding, not after.
    
1. **TEST**!
    1. Don't use your original example.
    1. Analyze (line by line).
    1. Test with a:
        1. Small test case.
        1. Edge test case.
        1. Big test case.
    1. Test your code, not your algorithm!
    1. Think before fixing bugs (so that you won't introduce new bugs, or make the code missy or hard).
    1. Don't panic, you might not solve it from the first round.
    
---

## 3 Algorithm Strategies

1. B.U.D.
   - Go through your brute-force or best solution right now and look for:
        1. **B**ottlenecks
        1. **U**nnecessary Work
        1. **D**uplicated Work
1. Space & Time Tradeoffs
   - Always have **hash tables** at the top of your mind
1. D.I.Y. (Do it Yourself)
    - Try to solve it in your mind, and write a code that behaves the same.
    - Use a large and generic example.
    - Reverse engineering your thoughts!

---

## Bit Manipulation in a Nutshell

* Get the i*th* bit of x --> `x & (1 << i)`
* Set the i*th* bit of x --> `x | (1 << i)`
* Clear the i*th* bit of x --> `x & ~(1 << i)`


---

## Linked Lists VS Arrays

| Case # | Operation / Data Structure | Arrays | Linked Lists |
|------- |--------------------------- |------- |------------- |
| 1 | get (retrieve) | Constant | Linear |
| 2 | insert and delete (@ start) | Linear | Constant |
| 3 | insert and delete (@ end) | Constant | Linear |

**Clarifications:**
* Case #1
    - An array will get any item by index in a constant `O(1)` time.
    - A linked list needs to traverse and count nodes until it reaches the needed item and returns it so that it needs a linear `O(n)` time.

* Case #2
    - An array will access the needed index in a constant `O(1)` time and add or delete it, but it needs a linear `O(n)` to shift **all** the old nodes to right in the case of adding and to left in the case of removing.
    - A linked list needs to traverse a **few** nodes (since we will add or delete from the start), add or delete the new node and update the pointers, so it needs a constant `O(1)` time.
    
* Case #3
    - An array will access the needed index in a constant `O(1)` time and add or delete it, and since we are adding or deleting from the end, it needs a constant `O(1)` to shift the **few** old nodes to right in the case of adding and to left in the case of removing.
    - A linked list needs to traverse **almost all** nodes (since we will add or delete from the end), add or delete the new node and update the pointers, so it needs a linear `O(n)` time.
    

---

## Sort Algorithms

> **A great website to visualize and understand the different sorting algorithms is [visualgo.net](https://visualgo.net/en/sorting)**.

| Algorithm | Average Time Complexity | Worst Time Complexity | Worst Space Complexity | Keys / Notes | Stability |
|----------- |------------------------ |---------------------- |----------------------- |------------- |---------- |
| **Best Time:**
| Quick Sort | O(n lg n) | O(n^2) | O(lg n) | Pivot could make things missy | **Not** stable |
| Merge Sort | O(n lg n) | O(n lg n) | O(n) | Divide and conquer | Stable |
| Heap Sort | O(n lg n) | O(n lg n) | O(1) *in-place* | Heapsort is significantly slower than Quicksort and Merge Sort, so Heapsort is less commonly encountered in practice. | **Not** stable |
|
| **Best Space:**
| Bubble Sort | O(n^2) | O(n^2) | O(1) *in-place* | Compare every pair and swap if they are not in order | Stable |
| Insertion Sort | O(n^2) | O(n^2) | O(1) *in-place* | Compare every item with all previous items, if a smaller (a larger) item is found, move all items in between to right and *insert* that item in the correct place. | Stable |
| Selection Sort | O(n^2) | O(n^2) | O(1) *in-place* | Find the smallest (largest) item and add it to the end of the sorted part. Usually worse than insertion sort. *The first part is always sorted*. | **Not** stable |


* Lower bound for sorting algorithms is O(n lg n).
* A sorting algorithm is stable if two objects with equal keys appear in the same order in sorted output as they appear in the input array to be sorted. Informally, stability means that equivalent elements retain their relative positions, after sorting.
* Read more about different sorting algorithms in [HappyCoders.eu](https://www.happycoders.eu/algorithms/).

---

## Search Algorithms

| Algorithm | Average / Worst Time Complexity | Average / Worst Space Complexity | Why to use? | Notes |
|---------- | ------------------------------- |--------------------------------- |------------ |------ |
| Binary Search | O(lg n) | O(lg n) | *Best time* | **Works with sorted data only**. Extra space is needed for the call stack in the recursive solution. |
| Linear Search | O(n) | O(1) *in-place* | *Best space* | Works with any (sorted or unsorted) data. |

---

## Trees

### Tree Traversals
- Pre-order: **root** --> left --> right
- In-order: left --> **root** --> right
- Post-order: left --> right --> **root**

---

## Binary Trees

### Types
- A **binary tree** is a tree where every node has a max of 2 children.
  
- A **perfect binary tree** is a *binary* tree where all levels are full (every node has 2 children).
  
- A **complete binary tree** is a *binary* tree where all levels are full (every node has 2 children) except (possibly) the last level.
    - Every perfect tree is a complete tree.

- A **balanced binary tree** is a *binary* tree in which the left and right subtrees of every node differ in height by no more than 1.

- A **full binary tree** is a *binary* tree in which every node has either 0 or 2 children.

- A **binary search tree** is a *binary* tree whose internal nodes each store a key greater than all the keys in the node's left subtree and less than those in its right subtree.
    - An in-order traversal for a binary search tree will give us ascending sorted data.
    - A binary search tree is an ideal way to go with the hierarchical way of storing data.

### Useful Computations
In any ***perfect binary tree***:
* Number of nodes `n` = `2^(h-1)`. Where `h` is the tree height.
* Height `h` = `lg (n+1)`. Where `n` is the number of nodes.
* Number of the nodes in the last level = number of nodes in all other levels + 1.

---

## Graphs

- A graph organizes items in an interconnected network.
- A graph consists of multiple nodes and edges between them.

### Classifications
A graph could be:
- Directed or Undirected
    - The edge is bidirectional in an undirected graph, but has a direction in a directed graph.
- Cyclic or Acyclic
    - A graph is cyclic if you can start from any node and come back to it in a closed path; acyclic otherwise.
- Weighted or Unweighted
    - The edge has a certain weight (importance/degree) in a weighted graph. All edges have the same weight in an unweighted graph.

### Representations
A graph could be represented with:
- An edge list
    - A list of all the edges in the graph.
    - Every edge is represented by the 2 nodes it connects.
    - An unconnected node (a node with no edges) will not be represented with this form.
- An adjacency list
    - A list where the index represents the node, and the value at that index is a list of the node's neighbours.
    - Another form of this representation is to use a map (a dictionary) where the key is the node, and the value is a list of neighbours.
- An adjacency matrix
    - A matrix of `0`s and `1`s indicating whether a node `x` connects to node `y` where `0` means unconnected and `1` means connected.

---

## SOLID Design Principles

### Dependency Inversion
- A high-level module should not depend on a low-level module.
- Both should depend on abstraction.
- Abstraction should not depend on details.
- Details should depend on abstraction.
- A [code example](https://github.com/mohnoor94/LearningDesignPatterns/tree/master/src/main/java/_00_solid_design_principles/dependency_inversion).


### Interface Segregation
- You should add the minimum amount of methods/code to each interface.
- At no point, the client should need to implement a method they do not need at all.
- A [code example](https://github.com/mohnoor94/LearningDesignPatterns/tree/master/src/main/java/_00_solid_design_principles/interface_segreggation).


### Liskov Substitution
- You should be able to substitute a sub-class for a base class without breaking the logic.
- A [code example](https://github.com/mohnoor94/LearningDesignPatterns/tree/master/src/main/java/_00_solid_design_principles/liskov_subsitution).


### Open-Closed
- Your code should be:
    - *Open* for extension.
    - *Closed* for modifications.
- A [code example](https://github.com/mohnoor94/LearningDesignPatterns/tree/master/src/main/java/_00_solid_design_principles/open_closed).


### Separation of Concerns (Single Responsibility)
- Every module, class or function should have responsibility over a single part of that program's functionality, and it should encapsulate that part.
- A [code example](https://github.com/mohnoor94/LearningDesignPatterns/tree/master/src/main/java/_00_solid_design_principles/single_responsibility).
- Read more about [Single Responsibility Principle](../posts/solid/java/single-responsibility-principle/).
---

# Sources and References
- [Cracking the Coding Interview](https://www.crackingthecodinginterview.com). A book by Gayle McDowell, 6th edition.
- [HappyCoders.eu](https://www.happycoders.eu/blog/). A blog by Sven Woltmann to make you a better Java programmer (and more).
