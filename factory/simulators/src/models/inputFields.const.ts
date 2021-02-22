import { InstructionCategory } from "./instruction.model";

export interface InputField {
  name: string;
  placeholder: string;
  required: boolean;
  label?: string;
  type: 'select' | 'textField';
  category?: { name: string; code: string }[];
}

export const DefaultConfig: InstructionCategory[] = [
  InstructionCategory.Measurement,
  InstructionCategory.Alarm,
  InstructionCategory.BasicEvent,
  InstructionCategory.LocationUpdateEvent,
  InstructionCategory.Sleep
];


export const MeasurementsForm: InputField[] = [
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
  },
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
    name: "alarmCategory",
    placeholder: "",
    required: true,
    label: "Alarm Category",
    type: "select",
    category: [
      { name: "CRITICAL", code: "301" },
      { name: "MAJOR", code: "302" },
      { name: "MINOR", code: "303" },
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
    name: "eventCategory",
    label: "Event Category",
    placeholder: "",
    type: "select",
    category: [{ name: "Basic", code: "400" }],
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
    name: "Event Category",
    label: "Event Category",
    placeholder: "",
    category: [{ name: "Location Update", code: "401" }, { name: "Location Update with Device", code: "402" }],
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
  },
];

export const SeriesSleepForm: InputField[] = [...SleepForm];

