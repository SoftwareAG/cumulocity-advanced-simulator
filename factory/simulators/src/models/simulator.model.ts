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
  type: string;
  c8y_DeviceSimulator: {
    commandQueue: { type: string; messageId: string; values: string[] }[];
  };
  instances: number;
  name: string;
  id: string;
  state: string;
}
