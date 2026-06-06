---
title: "Scalability 02 | Start Small (Single-Server Configuration)"
date: 2021-04-02T18:04:24+03:00
slug: "scalability-start-small-single-server-configuration"
aliases: ["/sd/2", "/scalability/2"]
tags: ["Server", "DNS", "IP", "HTTP", "Request", "Single-Server", "Service", "Growth", "Concurrency"]
categories: ["System Design"]
series: ["Scalability"]
hideSummary: false
summary: "In this post, we will take a step back, and discuss how could we start small and simple with our website before considering
any scalability options, and we will discuss when should we start considering them"
---

## Introduction

In this post, we will take a step back, and discuss how could we start small and simple with our website before considering
any scalability options, and we will discuss when should we start considering them.

---

## Single-Server Configuration

This is the simplest configuration, and the one you may start with for your small business or project.

You need the following parts in your system:
1. **Server** in which you will host your website/system, and this server (computer) should be an **always-connected** server
as you need to server your customers (clients) in any time!
   - The server could be your personal computer or a cloud-based one!
   - Since we have a *single server*, all of our applications will be installed and served from it. This includes any database
   management systems (like MySQL, PostgreSQL, or MongoDB), dynamic, and static resources (like images, videos, web-pages,
     CSS (Cascading Style Sheets) files).
   
2. **DNS** (Domain Name Server) is the server that provide your customers with your **IP** (Internet Protocol) address.
   - This is usually a paid server.
   - The simplest abstraction to think about DNS is a system that acts like a cache, or a map to convert your domain name
     (like www.bynoor.io) to an actual IP address (like 132.126.15.3) of the server with your actual website contents.
   - Your first time users will connect to the DNS once, and when they got the actual IP of your server they start
     to send **HTTP** (Hypertext Transfer Protocol) requests directly to your server.
   - You may (or may not) got a static IP address for your server (as it's an extra paid service), that's why, once in a
   while, your users will be connected to the DNS again to make sure that they have the recent IP address of your server
     (this depends on multiple factors and could be discussed later).

The following figure illustrates the flow that your customers will have once your website is live.
{{< figure align="center" src="images/single-server.png" alt="Single Server Configuration" title="Single Server Configuration" class="internal-figure" >}}

---

## When (and Why) to Use a Single Server Configuration?

This (simple) configuration should be fine for a small personal website, blog, forum, or a small static website.
If that's what you are looking for, don't look further (unless, of course, you want to learn or work in the field!)

---

## When (and Why) to Scale?

This (simple) configuration cannot take you beyond some simple or basic scenarios. At some point, or for other use-cases
from the start, you should consider the possible ways of ***[Scalability](/scalability/1)***.

When this time will come? and when should you consider the different ***[Scalability](/scalability/1)*** options? If you have
any of the following points or scenarios, then that time is NOW:

1. **Increase in Traffic**, as your customers base grow, the load will increase on your single-server resources (such as 
   CPU, Memory, and I/O Operations).
   
2. **Increase in Data**, as your customers base grow, you will have a lot of data to store, process, and serve. Given
that the database queries are not the simplest tasks for your CPU and memory, you should really consider to scale at this
   point!
   
3. **Concurrency Limits**, as your customers base grow, you will have more users connects to your server *in the same time*,
and while your server could server 1000 users 5 by 5 (5 at a time), it may not be able to serve the same 1000 users 20 by 20
   (20 at a time)!

4. **System Growth**, as your business grow, you may need to add more and more new functionalities to server your customers.
   You should be aware that this will push your server resources even harder.
   
As you may notice, all the first 3 scenarios depend on your customer base growth, so expect them to happen simultaneously!


---

## How to Scale?

There are multiple scalability options, and that's exactly what we will talk about in this series! So *stay tuned*!

---

## Resources
- [Web Scalability for Startup Engineers (Book) 1st Edition. By Artur Ejsmont](https://www.amazon.com/Scalability-Startup-Engineers-Artur-Ejsmont/dp/0071843655).