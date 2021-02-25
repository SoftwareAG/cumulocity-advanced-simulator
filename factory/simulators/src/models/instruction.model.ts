import { GeoCoordinate } from "./geoCoordinate.model";

export enum InstructionCategory {
  "Measurement"="Measurement",
  "Alarm"="Alarm",
  "BasicEvent"="BasicEvent",
  "LocationUpdateEvent"="LocationUpdateEvent",
  "Sleep"="Sleep",
  "SmartRest"="SmartRest"
}

export type Instruction =
  | MeasurementInstruction
  | AlarmInstruction
  | BasicEventInstruction
  | SleepInstruction
  | EventInstruction
  | SmartRestInstruction;
export type SeriesInstruction =
  | SeriesMeasurementInstruction
  | AlarmInstruction
  | BasicEventInstruction
  | EventInstruction
  | SleepInstruction;

export interface Empty {}

export interface Instruction2 {
  type?: InstructionCategory;
  color?: string;
}

export interface SeriesMeasurementInstruction extends MeasurementInstruction {
  minValue: number | string;
  maxValue: number | string;
  steps: number | string;
  sleep?: number | string;
}

export interface SmartRestInstruction extends Instruction2 {
  minValue:string;
  maxValue: string;
  steps: string;
  value?: string;
  type: InstructionCategory.SmartRest;
}

export class SmartRestIns implements SmartRestInstruction {
  minValue: string;
  maxValue: string;
  steps: string;
  value?: string;
  type: InstructionCategory.SmartRest;
}
export interface MeasurementInstruction extends Instruction2 {
  fragment: string;
  series: string;
  value?: string;
  unit: string;
  type: InstructionCategory.Measurement;
}

export interface AlarmInstruction extends Instruction2 {
  alarmCategory: string;
  alarmType: string;
  alarmText: string;
  type: InstructionCategory.Alarm;
}

export interface BasicEventInstruction extends Instruction2 {
  eventCategory: string;
  eventType: string;
  eventText: string;
  type: InstructionCategory.BasicEvent;
}

export interface EventInstruction extends GeoCoordinate, Instruction2 {
  eventCategory: string;
  eventType: string;
  eventText: string;
  type: InstructionCategory.LocationUpdateEvent;
}

export interface SleepInstruction extends Instruction2 {
  sleep: number;
  type:InstructionCategory.Sleep;
}
