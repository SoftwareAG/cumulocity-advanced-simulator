
export interface CommandQueueEntry {
    messageId: MessageIds | string,
    type: 'sleep' | 'measurement' | 'builtin' | 'message',
    values?: string[],
    seconds?: number,
    templateId?: string,
    color?: string
}


export enum MessageIds {
    "Measurement" = "200",
    "Critical" = "301",
    "Major" = "302",
    "Minor" = "303",
    "Basic" = "400"
}
