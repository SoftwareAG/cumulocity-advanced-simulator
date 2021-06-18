
export interface CommandQueueEntry {
    messageId?: MessageIds | string;
    type: CommandQueueType;
    values?: string[];
    seconds?: number;
    templateId?: string;
}

export interface IndexedCommandQueueEntry extends CommandQueueEntry, AdditionalParameter {
}


export interface AdditionalParameter {
    index: string;
    mirrored?: boolean;
    deviation?: number[];
    color?: string;
}


export enum CommandQueueC8YMapping {
    "index" = "c8y_Indices",
    "mirrored" = "c8y_MirroredValues",
    "deviation" = "c8y_DeviationValue"
}


export enum MessageIds {
    "Measurement" = "200",
    "Critical" = "301",
    "Major" = "302",
    "Minor" = "303",
    "Basic" = "400",
    "LocationUpdate" = "401",
    "LocationUpdateDevice" = "402",
}

export enum CommandQueueType {
    "sleep"="sleep",
    "measurement"="measurement",
    "builtin"="builtin",
    "message"="message"
}

export interface InstructionsSeries {
    
}
