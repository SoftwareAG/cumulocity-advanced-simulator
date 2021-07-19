import { MessageIds } from '@models/commandQueue.model';
import { InputField } from '@models/inputFields.models';
import { InstructionCategory } from '@models/instruction.model';

export const DefaultConfig: InstructionCategory[] = [
  // FIXME rename
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
    name: 'fragment',
    label: 'Fragment',
    placeholder: 'Speed, Distance, Velocity',
    required: true,
    type: 'textField'
  },
  {
    name: 'series',
    label: 'Series',
    placeholder: 'Vehicles, Airplanes',
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

export const SeriesSleepForm: InputField[] = [
  ...SleepForm,
  {
    name: 'numberOfSleeps',
    label: 'Number of Sleeps',
    placeholder: '10',
    required: true,
    type: 'textField',
    minimum: 0,
    isNumber: true
  },
  {
    name: 'sleepsEqualToInstructions',
    label: 'Number of Sleeps Equal to Number of Instructions',
    placeholder: 'Max Sleeps',
    required: false,
    type: 'button'
  }
];
