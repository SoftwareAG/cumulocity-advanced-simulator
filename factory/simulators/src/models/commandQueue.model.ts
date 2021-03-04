
export interface CommandQueueEntry {
    messageId?: MessageIds | string,
    type: CommandQueueType,
    values?: string[] | string,
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

export enum CommandQueueType {
    "sleep"="sleep",
    "measurement"="measurement",
    "builtin"="builtin",
    "message"="message"
}
