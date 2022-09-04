import { Channel } from "../src";
import Select from "../src/select";
import { delay } from "../src/support/delay";

async function main() {
    const ch1 = new Channel<string>();
    const ch2 = new Channel<string>();

    (async function() {
        await delay(1000);
        await ch1.put("two");
        await delay(1000);
        await ch1.put("four");
        await delay(1000);
        await ch1.put("six");
        ch1.close();
    })();
    
    (async function() {
        await delay(500);
        await ch2.put("one");
        await delay(1000);
        await ch2.put("three");
        await delay(1000);
        await ch2.put("five");
        ch2.close();
    })();

    const select = new Select();

    while (!ch1.isClosed() || !ch2.isClosed()) {
        await select
            .caseTake(ch1, async (v) => console.log(v))
            .caseTake(ch2, async (v) => console.log(v))
            .end();
    }

    console.log("Completed")
}

main();