import { IManagedObject } from "@c8y/client";
export interface SimulatorModel {
  id: string;
  name: string;
  state?: string;
  instances?: number;
  commandQueue?: { type: string; messageId: string; values: string[] }[];
  supportedOperations?: string[];
}

export interface DeviceSimulator extends IManagedObject {
  type?: string;
  id: string;
  c8y_CustomSimulator?: {
    commandQueue?: { type: string; messageId: string; values: string[]} | {type: string; sleep: number} [];
    instances?: number;
    name?: string;
    id?: string;
    state?: string;
  };
}

export interface CustomSimulator extends IManagedObject {
  type?: string;
  id: string;
  name: string;
  c8y_CustomSim: {};
  c8y_DeviceSimulator?: {
    commandQueue?: { type: string; messageId: string; values: string[]}[] | {type: string; sleep: number} [];
    instances?: number;
    name?: string;
    id?: string;
    state?: string;
    c8y_SupportedOperations: string[];
    c8y_CustomOperations?: string[];

  };
  c8y_MeasurementSeries: [];
}
