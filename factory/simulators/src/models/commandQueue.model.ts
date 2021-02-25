
export interface CommandQueueEntry {
    messageId?: string,
    type: CommandQueueType,
    values?: string[],
    seconds?: number,
    templateId?: string,
    color?: string
}
export enum CommandQueueType {
    "sleep"="sleep",
    "measurement"="measurement",
    "builtin"="builtin",
    "message"="message"
}
