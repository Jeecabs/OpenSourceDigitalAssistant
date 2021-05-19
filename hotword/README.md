# New Age README

This connects to the main server via Socket connection

When it hears the keyword (currently "Leon") it emits the event to the main server.

Use case:

    - Showing off ??? 

    - Largely useless will evaluate if needed moving forward.


Consider https://github.com/Picovoice/porcupine


Snowboy is a dead project. (Which is ok things happen.) But yeah time to source a new alternative.  


## Why is this Javascript?

The `@picovoice/porcupine-node` does not export any types.

As this is the primary library for this module there is no justification to use Typescript as majority of the errors would have to be overrided.

Also the "records" directory is `https://github.com/gillesdemey/node-record-lpcm16` not sure what when wrong with the package but the npm imported package is a mess and doesn't function properly.


## TLDR What is new from the Old

- Snowboy gone. picovoice In.

- node-record-lpcm16 upgraded (and technically forked).

- Keyword changed from Leno to Jarvis.


# OLD README

# Hotword

This node enables the wake word "Leon". Once this is running, you can
call Leon by saying his name according to the language you chose.
## Getting Started

### Installation

```sh
# Install
npm run setup:offline-hotword
```

### Usage

```sh
# From the project root:

# Run main server
npm run build && npm start

# Go to http://localhost:1337

# Run hotword node
npm run wake

# Say "Leon" via your microphone
# Triggered!
```
