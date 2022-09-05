export class WaitGroup {
    #count = 0;
    #resolve?: () => void;
    #resolver = new Promise<void>(resolve => { 
        this.#resolve = resolve;
    });

    add(count: number): void {
        this.#count += count;
    }

    done(): void {
        if (this.#count > 0) {
            this.#count--;
        }

        if (this.#count === 0) {
            this.#resolve?.();
        }
    }

    async wait(): Promise<void> {
        return this.#resolver.then(() => {
            this.#resolver = new Promise<void>(resolve => {
                this.#resolve = resolve;
            });
        });
    }
}