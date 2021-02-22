
export interface CommandQueueEntry {
    messageId?: string,
    type: 'sleep' | 'measurement' | 'builtin' | 'message',
    values?: string[],
    seconds?: number,
    templateId?: string,
    color?: string
}
