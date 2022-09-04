import { Channel, isClosed } from "../src";

// Partition routine
function partition<T>(source: T[], predicate: (value: T) => boolean): [Channel<T>, Channel<T>] {
    const positive = new Channel<T>();
    const negative = new Channel<T>();

    (async function() {
        for (const value of source) {
            if (predicate(value)) {
                positive.put(value);
            } else {
                negative.put(value);
            }            
        }
        positive.close();
        negative.close();
    })();

    return [positive, negative];
}

// Print routine
async function print<T>(title: string, values: Channel<T>) {
    while (true) {
        const value = await values.take();
        if (isClosed(value)) {
            break;
        } 

        console.log(title, value);
    }
}

async function main() {
    const [even, odd] = partition([1,3,-1,5,-7,9,3,-5,2,-4,-7,4,-5,8,-1,-2,1], (v) => v % 2 === 0);

    print("Even number: ", even);
    print("Odd number: ", odd);

    await even.untilClosed();
    await odd.untilClosed();

    const [positive, negative] = partition([1,3,-1,5,-7,9,3,-5,2,-4,-7,4,-5,8,-1,-2,1], (v) => v > 0);
    print("Positive number: ", positive);
    print("Negative number: ", negative);

    await positive.untilClosed();
    await negative.untilClosed();
}

main();
