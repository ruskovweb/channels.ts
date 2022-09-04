import { Channel } from "../src";
import { delay } from "../src/support/delay";

async function worker(done: Channel<boolean>) {

    console.log("Working...");
    await delay(1000);
    console.log("done");

    done.put(true); // You can close the channel with `done.close();`
}

async function main() {
    const done = new Channel<boolean>();

    // Starting a worker without blocking the current "routine"
    worker(done); 

    await done.take(); // Or you can close the channel and wait with `await done.untilClosed();`
    console.log("Completed.");
}

main();
