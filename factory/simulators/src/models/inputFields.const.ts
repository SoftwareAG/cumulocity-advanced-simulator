export interface InputField {
    name: string;
    placeholder: string;
    required: boolean;
    label?: string;
    type?: 'select' | 'numberField';
}

export const DefaultConfig: string[] = ["Measurement", "Alarm", "Event", "BasicEvent", "Sleep"];

export const MeasurementsForm: InputField[] = [
    {
        name: 'fragment',
        label: 'Fragment:',
        placeholder: 'Value',
        required: true,
        type: 'select'
    },
    {
        name: 'series',
        label: 'Series:',
        placeholder: 'Value',
        required: true
    },
    {
        name: 'value',
        label: 'Value:',
        placeholder: 'Value',
        required: true
    },
    {
        name: 'unit',
        label: 'Unit:',
        placeholder: 'Value',
        required: true
    }
];

export const SeriesMeasurementsForm: InputField[] = [
    ...MeasurementsForm.filter((a) => a.name !== 'value'),
    {
        name: 'minValue',
        label: 'Minimum:',
        placeholder: 'Value',
        required: true
    },
    {
        name: 'maxValue',
        label: 'Maximum:',
        placeholder: 'Value',
        required: true
    },
    {
        name: 'steps',
        label: 'Steps:',
        placeholder: 'Value',
        required: true
    }
]

export const AlarmsForm: InputField[] = [
    {
        name: 'alarmType',
        label: 'Alarm Type',
        placeholder: 'Alarm Type',
        required: true
    },
    {
        name: 'alarmText',
        label: 'Alarm Text',
        placeholder: 'Alarm Text',
        required: true
    }

];

export const SeriesAlarmsForm: InputField[] = [
    ...AlarmsForm
]

export const BasicEventsForm: InputField[] = [
    {
        name: 'eventType',
        label: 'Event Type',
        placeholder: 'Event Type',
        required: true
    },
    {
        name: 'eventText',
        label: 'Event Text',
        placeholder: 'Event Text',
        required: true
    }

];

export const SeriesBasicEventsForm: InputField[] = [
    ...BasicEventsForm
];

export const EventsForm: InputField[] = [
   ...BasicEventsForm,
    {
        name: 'altitude',
        label: 'Altitude',
        placeholder: 'Altitude',
        required: true
    },
    {
        name: 'longitude',
        label: 'Longitude',
        placeholder: 'Longitude',
        required: true
    },
    {
        name: 'latitude',
        label: 'Latitude',
        placeholder: 'Latitude',
        required: true
    },
    {
        name: 'accuracy',
        label: 'Accuracy',
        placeholder: 'Accuracy',
        required: true
    }
];

export const SeriesEventsForm: InputField[] = [
    ...EventsForm
];

export const SleepForm: InputField[] = [
    {
        name: 'sleep',
        label: 'Sleep (in Seconds)',
        placeholder: 'Sleep (in Seconds)',
        required: true
    }
];

export const SeriesSleepForm: InputField[] = [
    ...SleepForm
];