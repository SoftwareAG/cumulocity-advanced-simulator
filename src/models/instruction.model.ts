import { MessageIds } from "./commandQueue.model";
import { GeoCoordinate } from "./geoCoordinate.model";

export enum InstructionCategory {
  "Measurement"="Measurement",
  "Alarm"="Alarm",
  "BasicEvent"="BasicEvent",
  "LocationUpdateEvent"="LocationUpdateEvent",
  "Sleep"="Sleep",
  "CSVImport" ="CSVImport",
  "SmartRest"="SmartRest"
}

export type Instruction =
  | MeasurementInstruction
  | AlarmInstruction
  | BasicEventInstruction
  | SleepInstruction
  | EventInstruction
  | SmartInstruction;
  
export type SeriesInstruction =
  | SeriesMeasurementInstruction
  | AlarmInstruction
  | BasicEventInstruction
  | EventInstruction
  | SleepSeriesInstruction
  | SeriesSmartRestInstruction
  | SeriesCSVInstruction;


export interface Empty {}

export interface Instruction2 {
  messageId?: MessageIds;
  type?: InstructionCategory;
  color?: string;
}

export interface SeriesMeasurementInstruction extends MeasurementInstruction {
  minValue: number | string;
  maxValue: number | string;
  steps: number | string;
  sleep?: number | string;
  index?: string;
  scalingOption?: string;
}
export interface SeriesCSVInstruction extends SmartInstruction {
  index?: string;
  type: InstructionCategory.CSVImport;
}

export interface SmartInstruction extends Instruction2 {
  type: InstructionCategory.SmartRest | InstructionCategory.CSVImport;
  // measurementOption?: string;
  [key: string]: string;
}

export interface SmartRestConfiguration {
  method: string;
  response: boolean;
  msgId: string;
  api: string;
  byId: boolean;
  externalIdType?: string;
  mandatoryValues?: {path: string; type: string; value: string}[];
  customValues: {path: string; type: string; value: string}[];
  name?: string;
}
export interface SmartRestInstruction extends Instruction2 {
  minValue?:string;
  maxValue?: string;
  steps?: string;
  value?: string;
  isNumber?: boolean;
  type: InstructionCategory.SmartRest;
}

export interface SeriesSmartRestInstruction extends SmartInstruction {}

export class SmartRestIns implements SmartRestInstruction {
  minValue: string;
  maxValue: string;
  steps: string;
  value?: string;
  type: InstructionCategory.SmartRest;
}
export interface MeasurementInstruction extends Instruction2 {
  messageId?: MessageIds.Measurement;
  fragment: string;
  series: string;
  value?: string;
  unit: string;
  type: InstructionCategory.Measurement;
}

export interface AlarmInstruction extends Instruction2 {
  messageId?: MessageIds.Critical | MessageIds.Major | MessageIds.Minor;
  alarmType: string;
  alarmText: string;
  type: InstructionCategory.Alarm;
  index?: string;
}

export interface BasicEventInstruction extends Instruction2 {
  messageId?: MessageIds.Basic;
  eventCategory: string;
  eventType: string;
  eventText: string;
  type: InstructionCategory.BasicEvent;
  index?: string;
}

export interface EventInstruction extends GeoCoordinate, Instruction2 {
  eventCategory: string;
  // eventType: string;
  // eventText: string;
  type: InstructionCategory.LocationUpdateEvent;
  index?: string;
}

export interface SleepInstruction extends Instruction2 {
  seconds: number | string;
  type:InstructionCategory.Sleep;
  index?: string;
}
export interface SleepSeriesInstruction extends SleepInstruction {
  numberOfSleeps?: number | string;
}
