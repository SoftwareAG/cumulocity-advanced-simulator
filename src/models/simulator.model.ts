import { IManagedObject } from '@c8y/client';
import { AdditionalParameter, CommandQueueEntry } from './commandQueue.model';
import { SeriesInstruction } from './instruction.model';

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
    commandQueue?: { type: string; messageId: string; values: string[] } | { type: string; sleep: number }[];
    instances?: number;
    name?: string;
    id?: string;
    state?: string;
  };
}

export interface C8YDeviceSimulator {
  id?: string;
  instances?: number;
  name?: string;
  state?: string;
  commandQueue?: CommandQueueEntry[];
  c8y_SupportedOperations?: string[];
}

export interface CustomSimulator extends IManagedObject {
  type?: string;
  id: string;
  c8y_Series: SeriesInstruction[];
  c8y_mirroredAxis?: boolean;
  c8y_additionals: AdditionalParameter[];
  c8y_intertwinedValues?: boolean;
  c8y_saltValue?: number;
  name: string;
  c8y_CustomSim: {};
  c8y_Indices?: string[];
  c8y_DeviceSimulator?: {
    commandQueue?: CommandQueueEntry[];
    instances?: number;
    name?: string;
    id?: string;
    state?: string;
    c8y_SupportedOperations?: string[];
    c8y_CustomOperations?: string[];
  };
  c8y_hasTemplate?: boolean;
  c8y_TemplateId?: string;
  c8y_MeasurementSeries?: [];
}

// export interface SimulatorTemplate extends IManagedObject {
//   type: string;
//   c8y_Simulator_Template: {};
//   c8y_Template: C8YDeviceSimulator;
// }
