import { GeoCoordinate } from "./geoCoordinate.model";


export interface Instruction {
    type: string;
}

export interface MeasurementInstruction extends Instruction{
    fragment: string;
    series: string;
    value: string;
    unit: string;
    type: 'Measurement';
}

export interface AlarmInstruction extends Instruction{
    alarmType: string;
    alarmText: string;
    type: 'Alarm';
}


export interface BasicEventInstruction extends Instruction{
    eventType: string;
    eventText: string;
    type: 'BasicEvent';
}


export interface EventInstruction
    extends GeoCoordinate, Instruction{
    eventType: string;
    eventText: string;
    type: 'Event';
}

export interface SleepInstruction extends Instruction{
    sleep: number;
    type: 'Sleep';
}