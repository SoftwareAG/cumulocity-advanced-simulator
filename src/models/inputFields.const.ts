import { MessageIds } from './commandQueue.model';
import { InstructionCategory } from './instruction.model';

export interface InputField {
  name: string;
  minimum?: number;
  placeholder?: string;
  required: boolean;
  label?: string;
  type: 'select' | 'textField' | 'switch'; // TODO refactor to html-default: 'select', 'text', 'checkbox'
  options?: MessageId[];
  defaultValue?: string | number;
  hidden?: boolean;
  isNumber?: boolean;
}

export interface MessageId {
  name: string;
  id: string;
  selected?: boolean;
}

export const DefaultConfig: InstructionCategory[] = [
  InstructionCategory.Measurement,
  InstructionCategory.Alarm,
  InstructionCategory.BasicEvent,
  InstructionCategory.LocationUpdateEvent,
  InstructionCategory.Sleep,
  InstructionCategory.SmartRest
];

export const MeasurementsForm: InputField[] = [
  {
    name: 'messageId',
    required: true,
    type: 'textField',
    hidden: true,
    defaultValue: MessageIds.Measurement
  },
  {
    name: 'series',
    label: 'Series',
    placeholder: 'Vehicles, Airplanes',
    required: true,
    type: 'textField'
  },
  {
    name: 'fragment',
    label: 'Fragment',
    placeholder: 'Speed, Distance, Velocity',
    required: true,
    type: 'textField'
  },
  {
    name: 'value',
    label: 'Value',
    placeholder: 'Measurement',
    required: true,
    type: 'textField',
    isNumber: true
  },
  {
    name: 'unit',
    label: 'Unit',
    placeholder: 'KM, °C, %, mph',
    required: true,
    type: 'textField'
  }
];

export const SeriesMeasurementsForm: InputField[] = [
  ...MeasurementsForm.filter((a) => a.name !== 'value'),
  {
    name: 'minValue',
    label: 'Min',
    placeholder: 'Lowest Measurement',
    required: true,
    type: 'textField',
    isNumber: true
  },
  {
    name: 'maxValue',
    label: 'Max',
    placeholder: 'Highest Measurement',
    required: true,
    type: 'textField',
    isNumber: true
  },
  {
    name: 'steps',
    label: 'Steps',
    placeholder: 'Number of values between min and max',
    required: true,
    type: 'textField',
    isNumber: true
  },
  {
    name: 'Randomize',
    required: false,
    label: 'Randomize Measurements',
    type: 'switch'
  }
];

export const AlarmsForm: InputField[] = [
  {
    name: 'messageId',
    placeholder: 'Severity',
    required: true,
    label: 'Alarm Category',
    type: 'select',
    options: [
      { name: 'CRITICAL', id: '301', selected: true },
      { name: 'MAJOR', id: '302' },
      { name: 'MINOR', id: '303' }
    ]
  },
  {
    name: 'alarmType',
    label: 'Alarm Type',
    placeholder: 'Motor Failure',
    type: 'textField',
    required: true
  },
  {
    name: 'alarmText',
    label: 'Alarm Text',
    placeholder: 'The motor overheated please let it cooldown',
    type: 'textField',
    required: true
  }
];

export const SeriesAlarmsForm: InputField[] = [...AlarmsForm];

export const BasicEventsForm: InputField[] = [
  {
    name: 'messageId',
    label: 'Event Category',
    placeholder: '',
    type: 'select',
    options: [{ name: 'Basic', id: '400' }],
    required: true,
    defaultValue: MessageIds.Basic
  },
  {
    name: 'eventType',
    label: 'Event Type',
    placeholder: 'The device restarted',
    required: true,
    type: 'textField'
  },
  {
    name: 'eventText',
    label: 'Event Text',
    placeholder: 'A planned restart was executed at 12pm',
    required: true,
    type: 'textField'
  }
];

export const SeriesBasicEventsForm: InputField[] = [...BasicEventsForm];

export const EventsForm: InputField[] = [
  //   ...BasicEventsForm,
  {
    name: 'messageId',
    label: 'Event Category',
    placeholder: '',
    options: [
      { name: 'Location Update', id: '401' },
      { name: 'Location Update with Device', id: '402' }
    ],
    type: 'select',
    required: true
  },
  {
    name: 'altitude',
    label: 'Altitude',
    placeholder: '658.4',
    required: true,
    type: 'textField',
    isNumber: true
  },
  {
    name: 'longitude',
    label: 'Longitude',
    placeholder: '8.6349013',
    required: true,
    type: 'textField',
    isNumber: true
  },
  {
    name: 'latitude',
    label: 'Latitude',
    placeholder: '49.8143',
    required: true,
    type: 'textField',
    isNumber: true
  },
  {
    name: 'accuracy',
    label: 'Accuracy',
    placeholder: 'Accuracy',
    required: true,
    type: 'textField',
    isNumber: true
  }
];

export const SeriesEventsForm: InputField[] = [...EventsForm];

export const SleepForm: InputField[] = [
  {
    name: 'seconds',
    label: 'Sleep (in Seconds)',
    placeholder: 'Sleep (in Seconds)',
    required: true,
    type: 'textField',
    minimum: 5,
    isNumber: true
  }
];

export const SeriesSleepForm: InputField[] = [...SleepForm];
