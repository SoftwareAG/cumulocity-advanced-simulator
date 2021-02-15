import { GeoCoordinate } from "./geoCoordinate.model";


export type Instruction = MeasurementInstruction | AlarmInstruction | BasicEventInstruction | SleepInstruction | EventInstruction;

export enum InstructionCategory {
    'Measurement', 'Alarm', 'Event', 'Sleep', 'BasicEvent'
}
export interface Instruction2 {
    type?: string;
}

export interface MeasurementInstruction extends Instruction2 {
    fragment: string;
    series: string;
    value: string;
    unit: string;
    type: 'Measurement';
}

export interface AlarmInstruction extends Instruction2 {
    alarmType: string;
    alarmText: string;
    type: 'Alarm';
}


export interface BasicEventInstruction extends Instruction2 {
    eventType: string;
    eventText: string;
    type: 'BasicEvent';
}


export interface EventInstruction
    extends GeoCoordinate, Instruction2 {
    eventType: string;
    eventText: string;
    type: 'Event';
}

export interface SleepInstruction extends Instruction2 {
    sleep: number;
    type: 'Sleep';
}