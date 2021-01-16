export interface SimulatorModel {
    id: string;
    name: string;
    state: string;
    instances: number;
    commandQueue: {type: string; messageId: string; values: string[]} [];
}