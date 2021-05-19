# Open Source Digital Assistant

## Note: Currently not functional

## Disclaimer

This is a Fork of Leon.AI (<https://getleon.ai>). While this project aims to be a different approach, the initial foundation that the Leon.AI repo provided cannot be understated.

## What is different?

### Backend

TypeScript instead of Vanilla Javascript

Upgraded Libraries ported other to new APIs.

- Deepspeech v0.5 -> v0.9

Approaching the "skills" aspect different from the original project.

Changed Offline TTS. (Flite -> espnet2)

Implementation/Support is focused on open-source alternatives to Google/Azure/IBM/AWS services. (3rd party libraries (e.g. AWS SDK) will eventually be supported but it is not the focus)

### Frontend

ReactJS instead of Vanilla HTML/CSS/JS Bundle .

# File Structure

```
"app" Represents the Web app side of things. (TODO REPLACE WITH REACTJS APPLICATION)

"server" naturally represents the server (ExpressJS server). (TODO REPLACE WITH GRAPHQL)

"hotword" a separate process from "server" that listens for "hotwords" to start listening for a follow up command.

"TTS_Python" represents the Web API that is for TTS.

"web-app" ReactJS that is the front-end (Will be replacing "app")
```

## (Upcoming) Redesign of Architecture

Currently all the interaction between the Server and the client is done via a Websocket connection.

At somepoint a level of persistance between sessions would be useful and that persistance would allow for a REST/GraphQL (non-subscription) interface

## Plan (Tentative data points so assumptions are made.)

It appears that Leon's skills are defined in Python.

While Python ultimately can provide my libraries that would result in greater utility the potentially overhead of problem solving errors across a bridge would prove to be too great a time sink to use Leon as a Virtual Assistant that is continually iterated on.

So with the intention of having a living Virtual Assistant that improves over time the plan is to port some of the basic skills over to Javascript (Specifically TypeScript) in hopes of ensuring the development experiment in painless.

## Update 13/2/2021

For the Python skills there an Web API will be used to communicate with the main JS/TS Server.

This saves having to do the hacky calling of python processes that was occurring before. (FastAPI is also the good stuff)

So this project seems unfortunately end up using a lot more python than intended (which is fine just against my preferred style of lightweight single language)

# Notes regarding some of the library

AWS/IBM/GoogleCloud Voice/Text services. At this point I am very happy with Deepspeech. For the sake of maintaining this as a agile fork of Leon I'm thinking there is little need for additional text-to-speech/speech-to-text/NER providers.

## Speculated Roadmap

At somepoint I'd imagine Prisma (v2 ORM) will be integrated with a local sqlite file to add in a persistance layer and eventually bridge over to a proper PostgreSQL database to ensure that each process of the Server is stateless without losing persistance across sessions.

The roadmap ultimately is dependent on where I see the actual use cases for Virtual Assistant heading.



# README FROM ORIGINAL REPO

<p align="center">
  <a href="https://getleon.ai"><img width="96" src="https://getleon.ai/img/logo.svg"></a><br><br>
  <a href="https://www.youtube.com/watch?v=p7GRGiicO1c"><img width="512" src="https://getleon.ai/img/1.0.0-beta.0_preview_en.png"></a><br>
</p>

<h1 align="center">Leon</h1>

_<p align="center">Your open-source personal assistant.</p>_

<p align="center">
  <a href="https://github.com/leon-ai/leon/blob/develop/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat"/></a>
  <a href="https://circleci.com/gh/leon-ai/leon/tree/develop"><img src="https://img.shields.io/circleci/project/github/leon-ai/leon/develop.svg?style=flat"/></a>
  <a href="https://github.com/leon-ai/leon/blob/develop/.github/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat"/></a>
</p>

<p align="center">
  <a href="https://getleon.ai">Website</a> ::
  <a href="https://docs.getleon.ai">Documentation</a> ::
  <a href="https://roadmap.getleon.ai">Roadmap</a> ::
  <a href="https://github.com/leon-ai/leon/blob/develop/.github/CONTRIBUTING.md">Contributing</a> ::
  <a href="https://blog.getleon.ai/the-story-behind-leon/">Story</a>
</p>

---

**Note**

> I'm focusing on another project, so the progress of this repo might slow down for a while. You can [subscribe here](https://www.producthunt.com/upcoming/2aud-io) to be part of the first ones.

## Introduction

Leon is an **open-source personal assistant** who can live **on your server**.

He **does stuff** when you **ask him for**.

You can **talk to him** and he can **talk to you**.
You can also **text him** and he can also **text you**.
If you want to, Leon can communicate with you by being **offline to protect your privacy**.

### Why?

> 1. If you are a developer (or not), you may want to build many things that could help in your daily life.
>    Instead of building a dedicated project for each of those ideas, Leon can help you with his
>    packages/modules (skills) structure.
> 2. With this generic structure, everyone can create their own modules and share them with others.
>    Therefore there is only one core (to rule them all).
> 3. Leon uses AI concepts, which is cool.
> 4. Privacy matters, you can configure Leon to talk with him offline. You can already text with him without any third party services.
> 5. Open source is great.

### What is this repository for?

> This repository contains the following nodes of Leon:
>
> - The server
> - The packages/modules
> - The web app
> - The hotword node

### What is Leon able to do?

> Today, the most interesting part is about his core and the way he can scale up. He is pretty young but can easily scale to have new features (packages/modules).
> You can find what he is able to do by browsing the [packages list](https://github.com/leon-ai/leon/tree/develop/packages).

Sounds good for you? Then let's get started!

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 10
- npm >= 5
- [Python](https://www.python.org/downloads/) >= 3
- [Pipenv](https://docs.pipenv.org)
- Supported OSes: Linux, macOS and Windows

To install these prerequisites, you can follow the [How To section](https://docs.getleon.ai/how-to/) of the documentation.

### Installation

```sh
# Clone the repository (stable branch)
git clone -b master https://github.com/leon-ai/leon.git leon
# OR download the latest release at: https://github.com/leon-ai/leon/releases/latest

# Go to the project root
cd leon

# Install
npm install
```

### Usage

```sh
# Check the setup went well
npm run check

# Build
npm run build

# Run
npm start

# Go to http://localhost:1337
# Hooray! Leon is running
```

### Docker Installation

```sh
# Build
npm run docker:build

# Run on Linux or macOS
npm run docker:run

# Run on Windows (you can replace "UTC" by your time zone)
docker run -e TZ=UTC -p 1337:1337 -it leonai/leon

# Go to http://localhost:1337
# Hooray! Leon is running
```

## Documentation

For full documentation, visit [docs.getleon.ai](https://docs.getleon.ai).

## Roadmap

To know what is going on, follow [roadmap.getleon.ai](https://roadmap.getleon.ai).

## Contributing

If you have an idea for improving Leon, do not hesitate.

**Leon needs open source to live**, the more modules he has, the more skillful he becomes.

## The Story Behind Leon

You'll find a write-up on this [blog post](https://blog.getleon.ai/the-story-behind-leon/).

## Stay Tuned

- [Newsletter](https://getleon.ai)
- [Blog](https://blog.getleon.ai)
- [GitHub issues](https://github.com/leon-ai/leon/issues)
- [Twitter](https://twitter.com/louistiti_fr)
- [#LeonAI](https://twitter.com/hashtag/LeonAI)

## Author

**Louis Grenard** ([@louistiti_fr](https://twitter.com/louistiti_fr))

## Donate

You can also contribute by [buying me a fruit juice](https://donate.getleon.ai).

## License

[MIT License](https://github.com/leon-ai/leon/blob/develop/LICENSE.md)

Copyright (c) 2019-present, Louis Grenard <louis.grenard@gmail.com>

## Cheers

![Cheers!](https://github.githubassets.com/images/icons/emoji/unicode/1f37b.png "Cheers!")
