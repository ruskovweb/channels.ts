import { Channel, isClosed } from '../src/channel';
import { delay } from '../src/support/delay';

async function main() {
    const chan = new Channel<number>(Infinity);

    // Closing the channel after 10_000ms
    setTimeout(function() {
        chan.close();
    }, 10_000);

    // Producer routine
    (async function() {
        for (let i = 1; i <= 10; i++) {
            const random = Math.floor(Math.random() * 500);
            await delay(random);
            console.log("Produced: ", i);
            await chan.put(i);
        }
    })();

    // Consumer routine
    (async function() {
        while(true) {
            const random = Math.floor(Math.random() * 1000);
            await delay(random);
            const value = await chan.take();
            if (isClosed(value)) {
                break;
            }
            console.log("Consumed: ", value);
        }
    })();

    console.log("Waiting for the channel to be closed...");
    await chan.untilClosed();
    console.log("The channel has been closed.");
}

main();
