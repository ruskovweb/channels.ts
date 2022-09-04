import { Channel } from "../src"
import Select from "../src/select";

async function fibonacci(chan: Channel<number>, quit: Channel<number>) {
	const select = new Select();
    let x = 0;
    let y = 1;
    let b = false;

	while (!b) {
        await select
            .casePut(chan, x, async (temp) => {
                x = y;
                y = temp + y;
            })
            .caseTake(quit, async () => {
                console.log("quit");
                b = true;
            })
            .end();
	}
}

async function main() {
	const chan = new Channel<number>();
	const quit = new Channel<number>();

	(async function() {
        for (let i = 0; i < 10; i++) {
            console.log(await chan.take());
        }
        await quit.put(0);
	})();

	await fibonacci(chan, quit);

    console.log("completed");
}

main();