import { GeoCoordinate } from "./geoCoordinate.model";


export interface Instruction extends MeasurementInstruction, AlarmInstruction, BasicEventInstruction, EventInstruction, SleepInstruction {

}

export interface MeasurementInstruction {
    fragment?: string;
    series?: string;
    value?: string;
    unit?: string;
    type?: 'Measurement';
}

export interface AlarmInstruction {
    alarmType?: string;
    alarmText?: string;
    type?: 'Alarm';
}


export interface BasicEventInstruction {
    eventType?: string;
    eventText?: string;
    type?: 'BasicEvent';
}


export interface EventInstruction
    extends GeoCoordinate {
    eventType?: string;
    eventText?: string;
    type?: 'Event';
}

export interface SleepInstruction {
    sleep?: number;
    type?: 'Sleep';
}