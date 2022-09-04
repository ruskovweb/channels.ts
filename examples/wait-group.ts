import WaitGroup from "../src/wait-group";
import { delay } from "../src/support/delay";

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
