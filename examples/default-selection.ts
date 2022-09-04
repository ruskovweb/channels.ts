import { Channel } from "../src";
import Select from "../src/select";
import { delay } from "../src/support/delay";

async function main() {
    const tick = new Channel<number>();
    const boom = new Channel<number>();
    const select = new Select();

    const i = setInterval(() => {
        tick.put(0);
    }, 100);

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

    tick.close();
    boom.close();
    clearInterval(i);
    clearTimeout(t);
    console.log("Completed")
}

main();
