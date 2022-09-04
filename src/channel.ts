import { Queue } from "./support/queue";

const closedSymbol = Symbol("Closed");

export interface Closed {
    [closedSymbol]: boolean;
}

export const CLOSED: Closed = {
    [closedSymbol]: true,
};

export function isClosed<T>(value: T | Closed): value is Closed {
    return value === CLOSED;
}

export class Channel<T> {
    #puts = new Queue<() => T>();
    #takes = new Queue<((data: T | Closed) => void)>();
    
    #bufferSize: number;
    #closed = false;
    #requestedForClose = false;
    #resolveWhenClosed?: () => void;
    #whenClosedPromise = new Promise<void>(resolve => { 
        this.#resolveWhenClosed = resolve;
    });

    [Symbol.asyncIterator] = (): AsyncIterator<T, Closed> => {
        return {
            next: async () => {
                const value = await this.take();

                if (isClosed(value)) {
                    return {
                        value: CLOSED,
                        done: true
                    };
                }

                return {
                    value: value,
                    done: false
                }
            }
        }
    }

    constructor (bufferSize: number = 1, ...items: T[]) {
        this.#bufferSize = bufferSize;

        for (const item of items) {
            new Promise<void>((resolvePut) => {
                this.#puts.enqueue(() => {
                    resolvePut();
                    return item;
                });
            })
        }
    }

    async put(value: T): Promise<void> {
        if (this.#requestedForClose) return;
        
        return new Promise(resolvePut => {
            if (this.#takes.isNotEmpty()) {
                this.#takes.dequeue()!(value);
                resolvePut();
            } else {
                if (this.#puts.count() >= this.#bufferSize) {
                    this.#puts.enqueue(() => {
                        resolvePut();
                        return value;
                    });
                } else {
                    this.#puts.enqueue(() => {
                        return value;
                    });                    
                    resolvePut();
                }
            }
        });
    }

    async take(): Promise<T | Closed> {
        if (this.#closed) return CLOSED;

        return new Promise(resolveTake => {
            if (this.#puts.isNotEmpty()) {
                resolveTake(this.#puts.dequeue()!());

                if (this.#requestedForClose && this.#puts.isEmpty()) {
                    this.closeChannel();
                }
            } else {
                this.#takes.enqueue(resolveTake);
            }
        });
    }

    public close(): void {
        this.#requestedForClose = true;

        if (this.#puts.isEmpty()) {
            this.closeChannel();
        }
    };

    private closeChannel(): void {
        this.#closed = true;

        if (this.#takes.isNotEmpty()) {
            this.#takes.dequeue()!(CLOSED);
        }

        if (this.#resolveWhenClosed != null) {
            this.#resolveWhenClosed();
        }
    }

    public forceClose(): void {
        this.#requestedForClose = true;
        this.closeChannel();
    }

    public untilClosed(): Promise<void> {
        return this.#whenClosedPromise;
    }

    public isClosed(): boolean {
        return this.#closed;
    }

    public isRequestedForClose(): boolean {
        return this.#requestedForClose;
    }

    public reopen(): void {
        this.#closed = false;
        this.#requestedForClose = false;
        this.#whenClosedPromise = new Promise<void>(resolve => { 
            this.#resolveWhenClosed = resolve;
        });
    }

    public clear(): void {
        this.#puts = new Queue<() => T>();
        this.#takes = new Queue<((data: T | Closed) => void)>();
    }
}
