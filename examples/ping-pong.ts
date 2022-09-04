import { Channel, isClosed } from "../src";

async function playground() {
    const channel = new Channel<"ping" | "pong">(1, "ping");
    let counter = 1;
    
    // Each player is a new routine. 
    // They are communicating and passing the ping and pong values to each other.
    async function player(name: "ping" | "pong") {
        while (!channel.isClosed()) {
            const value = await channel.take();
            if (isClosed(value)) {
                break;
            }
    
            console.log(value);
            if (counter++ >= 20) {
                channel.close();
            }
            
            await channel.put(name);
        }
    }
    
    player("pong");
    player("ping");
    
    await channel.untilClosed();
}

playground();