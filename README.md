<h1 align="center">TypeScript Channels</h1>

<p align="center">
The simplest implementation of Golang channels, selects and wait groups
</p>

<p align="center">
    <img src="/assets/images/go-channel.png" />
</p>

## Installation

You can use one of the following package managers:

- Node package manager [npm](https://www.npmjs.com/package/channels.ts):

```bash
npm install channels.ts
```

- Yarn package manager [yarn](https://yarnpkg.com/package/channels.ts):

```bash
yarn add channels.ts
```

## How to use it?

### Channels

```ts
import { Channel, isClosed } from 'channels.ts';

async function main() {
    const chan = new Channel<number>();

    // Closing the channel after 10_000ms
    setTimeout(function() {
        chan.close();
    }, 10_000);

    // Producer routine
    (async function() {
        for (let i = 1; i <= 10; i++) {
            await chan.put(i);
        }
    })();

    // Consumer routine
    (async function() {
        for await (const value of chan) {
            console.log(value);
        }
    })();

    console.log("Waiting for the channel to be closed...");
    await chan.untilClosed();
    console.log("The channel has been closed.");
}

main();
```

Output:
```
Waiting for the channel to be closed...
1
2
3
4
5
6
7
8
9
10
The channel has been closed.
```

First we create a channel of numbers. By default the channel will have a buffer size of 1. Then we define two routines. They are simple IIFE functions that represent the go routines. They are executed immediately and we forget about them. That's why the `Waiting for the channel to be closed...` message appeared first. Now they can communicate with each other through our channel. The first routine writes to the channel and the second one reads from it. Finally with the `chan.untilClosed()` we are waiting for the channel to be closed, otherwise the program will exit immediately.

For more details see the [documentation](DOCUMENTATION.md).

### Select

```ts
import { Channel, Select, delay } from "channels.ts";

async function main() {
    const tick = new Channel<number>();
    const boom = new Channel<number>();
    const select = new Select();

    // Puts a value on every 100ms
    const i = setInterval(() => {
        tick.put(0);
    }, 100);

    // Puts a value after 1000ms
    const t = setTimeout(() => {
        boom.put(0);
    }, 1000)

    let b = false;
    while (!b) {
        await select
            .caseTake(tick, async () => console.log("tick."))
            .caseTake(boom, async () => {
                console.log("BOOM!");
                b = true;
            })
            .default(async () => {
                console.log("      .");
                await delay(10);
            })
            .end();
    }

    // Close all channels, intervals and timeouts
    tick.close();
    boom.close();
    clearInterval(i);
    clearTimeout(t);

    console.log("Completed")
}

main();
```

### Wait groups

```ts
import { WaitGroup, delay } from "channels.ts";

async function worker(id: number): Promise<void> {
    console.log(`Worker ${id} starting...`);
    await delay(id * 1000);
    console.log(`Worker ${id} done`);
}

async function main() {
    const wg = new WaitGroup();

    for (let i = 1; i <= 5; i++) {
        wg.add(1);

        (async function() {
            await worker(i);
            wg.done();
        })();
    }

    console.log("Waiting...");
    await wg.wait();
    console.log("Done");
}

main();
```

[All examples](./examples)
