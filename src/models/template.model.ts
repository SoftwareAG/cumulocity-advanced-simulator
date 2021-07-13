import { IManagedObject } from '@c8y/client';
import { AdditionalParameter, CommandQueueEntry } from './commandQueue.model';
import { SeriesInstruction } from './instruction.model';

export interface TemplateModel extends IManagedObject {
  c8y_SimulatorTemplate: {};
  c8y_additionals?: AdditionalParameter[];
  c8y_Template: {
    c8y_DeviceSimulator?: {
      commandQueue?: CommandQueueEntry[];
      instances?: number;
      name?: string;
      id?: string;
      state?: string;
      c8y_SupportedOperations?: string[];
      c8y_CustomOperations?: string[];
    };
    c8y_additionals: AdditionalParameter[];
    c8y_Series: SeriesInstruction[];
  };
}
