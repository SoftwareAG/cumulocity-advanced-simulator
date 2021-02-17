
export interface CommandQueueEntry {
    messageId?: string,
    type: 'sleep' | 'measurement' | 'builtin',
    values?: string[],
    seconds?: number,
    color?: string
}
