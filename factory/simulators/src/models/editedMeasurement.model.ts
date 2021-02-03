export interface EditedMeasurement {
    msmt: {
        fragment: string;
        msgId: string;
        series: string;
        unit: string;
        value: number;
    };
    index: number;
}