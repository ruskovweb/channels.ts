# Documentation

## Channels
Channels are a typed conduit through which you can send and receive values.

#### new Channel\<T\>(bufferSize: number, ...items: T[]): Channel\<T\>
- **description**: The channel's constructor. Receives buffer size and array of initial items. Initially the channel has a buffer size of 1. If you want an infinite buffer size you can pass `Infinity`. The channel will be filled with the initial array of items regardless of the size of the buffer. The channel has `AsyncIterator` symbol. This means that you can use the `for await of` loop. The loop will end when you close the channel.
- **params**:
  - `bufferSize: number = 1`
  - `...items: T[]`
- **returns**: 
  - `Channel<T>`

#### put(value: T): Promise\<void\>
- **description**: Puts an item into the channel. This operation will be blocked while the buffer is full. If you don't use an infinite buffer, but still want to call the `put` function without blocking the current "routine", then you can remove the `await` keyword and it will still work.
- **params**: 
  - `value: T`
- **returns**:
  - `Promise<void>`

#### take(): Promise\<T | Closed\>
- **description**: Returns an item from the channel. This operation will be blocked while the buffer is empty. If the channel is closed it will return a symbol of type `Closed`. You can use this symbol to check if the channel is closed. See the helper function below.
- **params**: 
  - `value: T`
- **returns**: 
  - `Promise<T | Closed>`

#### close(): void
- **description**: Closes the channel. If the buffer is not empty, the channel will not be closed immediately. It will be closed after all values have been taken and the buffer has been emptied. You can't put new values after calling this function, but you can take the rest from the buffer.
- **params**: -
- **returns**: 
  - `void`

#### isRequestedForClose(): boolean
- **description**: Returns a boolean indicating whether the channel is requested to be closed. If the `close()` function has been called and the buffer is not empty, then the `isRequestedForClose()` will return `true`. In this state the channel is not actually closed, because you still will be able to take values, but not to put.
- **params**: -
- **returns**: 
  - `boolean`

#### isClosed(): boolean
- **description**: Returns a boolean indicating whether the channel is actually closed. You can't put or take values when the channel is actually closed.
- **params**: -
- **returns**: 
  - `boolean`

#### forceClose(): void
- **description**: Force closes the channel. Unlike `close()`, `forceClose()` will close the channel immediately and you will not be able to take the rest values from the buffer. You can't put or take values when you close the channel forcibly.
- **params**: -
- **returns**: 
  - `void`

#### untilClosed(): Promise\<void\>
- **description**: Blocks the current "routine" and waits for the channel to be closed.
- **params**: -
- **returns**: 
  - `Promise<void>`

#### reopen(): void
- **description**: Reopens the channel if it is closed. If the channel has been forcibly closed you can still take the values when reopen the channel.
- **params**: -
- **returns**: 
  - `void`

#### clear(): void
- **description**: Clears the buffer.
- **params**: -
- **returns**: 
  - `void`

### Helpers

#### isClosed(value: T): boolean
- **description**: A helper function to check wether the channel is closed. You should pass the returned value from the `take()` function.
- **params**:
  - `value: T`
- **returns**: 
  - `boolean`

## Select
The select statement lets a routine wait on multiple communication operations.
A select blocks until one of its cases can run, then it executes that case (action).

#### casePut<T>(ch: Channel<T>, value: T, action: Action<T>): Select
- **description**: Puts the provided value to the channel and passes that value to the action.
- **params**: 
  - `ch: Channel<T>`
  - `value: T`
  - `action: Action<T>`
- **returns**: 
  - `Select`

#### caseTake<T>(ch: Channel<T>, action: Action<T>): Select
- **description**: Takes a value from the channel and passes the value to the action.
- **params**:
  - `ch: Channel<T>`
  - `action: Action<T>`
- **returns**: 
  - `Select`

#### default(action: () => void): Select
- **description**: Receives an action that will be executed if all cases are blocked.
- **params**: 
  - `action: () => void`
- **returns**: 
  - `Select`

#### end(): Promise<void>
- **description**: Each select "statement" must end with the `end` function to block the current "routine".
- **params**: -
- **returns**: 
  - `Promise<void>`

## WaitGroup
A WaitGroup waits for a collection of routines to finish. The main routine calls `add()` to set the number of routines to wait for. Then each of the routines runs and calls `done()` when finished. At the same time, `wait()` can be used to block until all routines have finished.

#### add(count: number): void
- **description**: Increments the internal counter with the provided count.
- **params**:
  - `count: number`
- **returns**: 
  - `void`

#### done(): void
- **description**: Decrements the internal counter.
- **params**: -
- **returns**: 
  - `void`

#### wait(): Promise<void>
- **description**: A function that blocks the current "routine" while the counter is greater than zero.
- **params**: -
- **returns**: 
  - `Promise<void>`

## Delay

#### delay(ms: number): Promise<void>
- **description**: Receives a number representing the await time in milliseconds. Blocks the current "routine" for that time.
- **params**:
  - `ms: number`
- **returns**: 
  - `Promise<void>`
