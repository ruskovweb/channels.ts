import { Channel, isClosed } from "./channel";

type Action<T> =  (value: T) => Promise<void>;
interface Case<T> {
    i: number;
    v: T
}

export default class Select {
    resolved = new Channel<Case<any>>(Infinity);
    statuses: boolean[] = [];
    actions: Action<any>[] = [];
    total = -1;
    count = 0;

    caseTake<T>(ch: Channel<T>, action: Action<T>): Select {
        if (this.actions.length === this.total) {
            const i = this.count % this.total;
            if (this.statuses[i]) {
                ch.take().then(v => {
                    this.statuses[i] = true;
                    if (!ch.isClosed()) {
                        this.resolved.put({i ,v});
                    }
                })
                this.actions[i] = action;
                this.statuses[i] = false;
            }
        } else {
            const i = this.count;
            ch.take().then(v => {
                this.statuses[i] = true;
                if (!ch.isClosed()) {
                    this.resolved.put({i ,v});
                }
            })
            this.actions.push(action);
            this.statuses.push(false);
        }

        this.count++;
        return this;
    }
    
    casePut<T>(ch: Channel<T>, value: T, action: Action<T>): Select {
        if (this.actions.length === this.total) {
            const i = this.count % this.total;
            if (this.statuses[i]) {
                ch.put(value).then(() => {
                    this.statuses[i] = true;
                    if (!ch.isClosed()) {
                        this.resolved.put({i ,v: value})
                    }
                });
                this.actions[i] = action;
                this.statuses[i] = false;
            }
        } else {
            const i = this.count;
            ch.put(value).then(() => {
                this.statuses[i] = true;
                if (!ch.isClosed()) {
                    this.resolved.put({i ,v: value})
                }
            });
            this.actions.push(action);
            this.statuses.push(false);
        }

        this.count++;        
        return this;
    }

    default(action: () => Promise<void>): Select {
        if (this.actions.length == this.total) {
            const i = this.count % this.total;
            if (this.statuses.every(s => s === false)) {
                this.resolved.put({ i, v: undefined });
            }        
        } else {
            this.actions.push(action);
            this.statuses.push(false);
            
            if (this.statuses.every(s => s === false)) {
                this.resolved.put({ i: this.count, v: undefined });
            }        
        }

        this.count++;
        return this;
    }
    
    async end(): Promise<void> {
        this.total = this.actions.length;
        
        const r = await this.resolved.take();

        if (!isClosed(r)) {
            await this.actions[r.i](r.v);
        }
    }
}
