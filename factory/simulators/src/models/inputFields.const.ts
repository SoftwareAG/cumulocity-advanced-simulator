import { MessageIds } from "./commandQueue.model";
import { InstructionCategory } from "./instruction.model";

export interface InputField {
  name: string;
  minimum?: number;
  placeholder?: string;
  required: boolean;
  label?: string;
  type: 'select' | 'textField';
  options?: MessageId[];
  defaultValue?: string | number;
  hidden?: boolean;
}

export interface MessageId {
  name: string;
  id: string;
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
    name: "messageId",
    required: true,
    type: 'textField',
    hidden: true,
    defaultValue: MessageIds.Measurement
  },
  {
    name: "fragment",
    label: "Fragment:",
    placeholder: "Value",
    required: true,
    type: "textField"
  },
  {
    name: "series",
    label: "Series:",
    placeholder: "Value",
    required: true,
    type: "textField"
  },
  {
    name: "value",
    label: "Value:",
    placeholder: "Value",
    required: true,
    type: "textField"
  },
  {
    name: "unit",
    label: "Unit:",
    placeholder: "Value",
    required: true,
    type: "textField"
  }
];

export const SeriesMeasurementsForm: InputField[] = [
  ...MeasurementsForm.filter((a) => a.name !== "value"), 
  {
    name: "minValue",
    label: "Minimum:",
    placeholder: "Value",
    required: true,
    type: "textField"
  },
  {
    name: "maxValue",
    label: "Maximum:",
    placeholder: "Value",
    required: true,
    type: "textField"
  },
  {
    name: "steps",
    label: "Steps:",
    placeholder: "Value",
    required: true,
    type: "textField"
  },
];

export const AlarmsForm: InputField[] = [
  {
    name: "messageId",
    placeholder: "",
    required: true,
    label: "Alarm Category",
    type: "select",
    options: [
      { name: "CRITICAL", id: "301" },
      { name: "MAJOR", id: "302" },
      { name: "MINOR", id: "303" },
    ],
  },
  {
    name: "alarmType",
    label: "Alarm Type",
    placeholder: "Alarm Type",
    type: "textField",
    required: true,
  },
  {
    name: "alarmText",
    label: "Alarm Text",
    placeholder: "Alarm Text",
    type: "textField",
    required: true,
  },
];

export const SeriesAlarmsForm: InputField[] = [...AlarmsForm];

export const BasicEventsForm: InputField[] = [
  {
    name: "messageId",
    label: "Event Category",
    placeholder: "",
    type: "select",
    options: [{ name: "Basic", id: "400" }],
    required: true,
  },
  {
    name: "eventType",
    label: "Event Type",
    placeholder: "Event Type",
    required: true,
    type: "textField",
  },
  {
    name: "eventText",
    label: "Event Text",
    placeholder: "Event Text",
    required: true,
    type: "textField",
  },
];

export const SeriesBasicEventsForm: InputField[] = [...BasicEventsForm];

export const EventsForm: InputField[] = [
//   ...BasicEventsForm,

  {
    name: "messageId",
    label: "Event Category",
    placeholder: "",
    options: [{ name: "Location Update", id: "401" }, { name: "Location Update with Device", id: "402" }],
    type: "select",
    required: true,
  },
  {
    name: "altitude",
    label: "Altitude",
    placeholder: "Altitude",
    required: true,
    type: "textField",
  },
  {
    name: "longitude",
    label: "Longitude",
    placeholder: "Longitude",
    required: true,
    type: "textField",
  },
  {
    name: "latitude",
    label: "Latitude",
    placeholder: "Latitude",
    required: true,
    type: "textField",
  },
  {
    name: "accuracy",
    label: "Accuracy",
    placeholder: "Accuracy",
    required: true,
    type: "textField",
  },
];

export const SeriesEventsForm: InputField[] = [...EventsForm];

export const SleepForm: InputField[] = [
  {
    name: "sleep",
    label: "Sleep (in Seconds)",
    placeholder: "Sleep (in Seconds)",
    required: true,
    type: "textField",
    minimum: 5
  }
];

export const SeriesSleepForm: InputField[] = [...SleepForm];


