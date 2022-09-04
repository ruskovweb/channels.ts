export class Node<T> {
    value: T;
    prev?: Node<T>
    next?: Node<T>

    constructor(value: T, prev?: Node<T>, next?: Node<T>) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}
