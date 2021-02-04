import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';
import { IManagedObject } from "@c8y/client";

@Injectable({
  providedIn: 'root'
})
export class SimulatorSettingsService {
  resultTemplate = { commandQueue: [], name: "" };
  displayInstructionsOrSleep = false;
  defaultConfig: string[] = ["Measurements", "Alarms", "Events", "Sleep"];
  selectedConfig: string = this.defaultConfig[0];

  eventCategories = [
    { category: "Basic", code: "400" },
    { category: "Location Update", code: "400" },
    { category: "Location Update Device", code: "400" },
  ];

  selectedEventCategory = this.eventCategories[0].category;
  measurements = [];
  newFragmentAdded = false;
  alarms: {
    level?: string;
    alarmType: string;
    alarmText: string;
    steps?: string;
  }[] = [];
  events: {
    code: string;
    eventType: string;
    eventText: string;
    steps: string;
  }[] &
    {
      code: string;
      lat: string;
      lon: string;
      alt: string;
      accuracy: string;
      steps: string;
    }[] = [];
  alarmConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  selectedAlarmConfig: string = this.alarmConfig[0];
  eventConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  selectedEventConfig: string = this.eventConfig[0];

  currentMeasurement: {
    sleep: string;
    fragment: string;
    series: string;
    minValue: string;
    maxValue: string;
    steps: string;
    unit: string;
  };

  currentAlarm: {
    level: string;
    alarmType: string;
    alarmText: string;
    steps: string;
    sleep: string;
  };

  eventType: string;
  eventText: string;

  eventSteps: string;

  latitude: string;
  longitude: string;
  altitude: string;
  accuracy: string;

  randomSelected = false;

  template = {
    fragment: null,
    series: null,
    minValue: null,
    maxValue: null,
    steps: null,
    unit: null,
    tempType: "measurement",
  };

  testArray = [];
  scaledArray = [];

  mo: IManagedObject;
  data: any;
  simulatorName: string;
  commandQueue = [];
  currentIndex: number;
  insertIndex: number;
  toAddMsmtOrSleep = false;
  toDisplay = false;
  value: string;
  displayEditView = false;

  alternateMsmts = [];
  editMsmt;

constructor(private helperService: HelperService) { }

setMeasurements(msmts) {
  this.measurements = msmts;
}

generateRequest() {
  
  // this.resultTemplate.commandQueue = [];
  console.log(this.measurements);
  this.resultTemplate.commandQueue = [];
  
  let allSteps = 0;
  // if (!this.newFragmentAdded) {
  //   this.measurements = [this.deepCopy(this.template)];

  for (let value of this.measurements.filter((a) => a.fragment)) {
    allSteps += +value.steps;
    value.steps = +value.steps;
    value.minValue = +value.minValue;
    value.maxValue = +value.maxValue;

    if (this.testArray.find((x) => x.fragment === value.fragment)) {
      const pos = this.testArray.findIndex(
        (x) => x.fragment === value.fragment
      );

      const nowScaled = this.helperService.scale(
        value.minValue,
        value.maxValue,
        value.steps,
        this.randomSelected
      );
      this.scaledArray[pos].push(...nowScaled);
    } else {
      const nowScaled = this.helperService.scale(
        value.minValue,
        value.maxValue,
        value.steps,
        this.randomSelected
      );
      this.testArray.push(value);
      this.scaledArray.push(nowScaled);
    }
  }
  
  for (let value of this.testArray) {
    for (const { temp, index } of this.helperService
      .scale(value.minValue, value.maxValue, value.steps, this.randomSelected)
      .map((temp, index) => ({ temp, index }))) {
      let toBePushed = `{
                            "messageId": "200",
                            "values": ["FRAGMENT", "SERIES", "VALUE", "UNIT"], "type": "builtin"
                            }`;

      toBePushed = toBePushed.replace("FRAGMENT", value.fragment);
      toBePushed = toBePushed.replace("SERIES", value.series);
      toBePushed = toBePushed.replace("VALUE", temp);
      toBePushed = toBePushed.replace("UNIT", value.unit);

      this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));

      // TODO: Add sleep here to push to resultTemplate.commandQueue
      this.currentMeasurement = this.testArray[this.testArray.length - 1];
      if (
        this.currentMeasurement.sleep &&
        this.currentMeasurement.sleep !== ""
      ) {
        this.resultTemplate.commandQueue.push({
          type: "sleep",
          seconds: value.sleep ? value.sleep : this.currentMeasurement.sleep,
        });
      }

      if (
        this.alarms &&
        this.selectedAlarmConfig === this.alarmConfig[1] &&
        index < this.alarms.length
      ) {
        this.toAlarmTemplateFormat(this.alarms[index]);
      }

      if (
        this.events &&
        this.selectedEventConfig === this.eventConfig[1] &&
        index < this.events.length
      ) {
        this.toEventTemplateFormat(this.events[index]);
      }
    }

    // if (this.selectedMsmtOption === this.measurementOptions[1]) {
    //   this.implementAlternateMsmst();
    // }

    const test = this.scaledArray.map((entry, i) => ({
      data: entry,
      label: this.testArray[i].series,
    }));

    if (this.selectedAlarmConfig === this.alarmConfig[0]) {
      this.generateAlarms();
    }

    if (this.selectedEventConfig === this.eventConfig[0]) {
      this.generateEvents();
    }

    // this.commandQueue.push(...this.resultTemplate.commandQueue);
  }
  this.displayAlarmsOnly();
  this.commandQueue.push(...this.resultTemplate.commandQueue);
  //   this.simService
  //     .updateSimulatorManagedObject(this.mo)
  //     .then((res) => console.log(res));
  console.log(this.commandQueue);
  console.log(this.resultTemplate.commandQueue);
}

generateAlarms() {
  for (let alarm of this.alarms.filter((a) => a.alarmText)) {
    let typeToNumber = { Major: 302, Critical: 301, Minor: 303 };
    this.toAlarmTemplateFormat(alarm);
    if (
      this.currentAlarm.sleep &&
      this.selectedAlarmConfig === this.alarmConfig[0]
    ) {
      this.resultTemplate.commandQueue.push({
        type: "sleep",
        seconds: this.currentAlarm.sleep,
      });
    }
  }
}

fetchCommandQueue() {
  return new Promise((resolve, reject) => {resolve(this.commandQueue)});
}

generateEvents() {
  for (let event of this.events) {
    this.toEventTemplateFormat(event);
    if (
      this.currentMeasurement.sleep &&
      this.selectedEventConfig === this.eventConfig[0]
    ) {
      this.resultTemplate.commandQueue.push({
        type: "sleep",
        seconds: this.currentMeasurement.sleep,
      });
    }
  }
}

toEventTemplateFormat(event) {
  let toBePushed = `{
    "messageId": "CODE",
    "values": ["TYPE", "TEXT"], "type": "builtin"
  }`;
  let toBePushedLoc = `{
    "messageId": "CODE",
    "values": ["LAT", "LON", "ALT", "ACCURACY"], "type": "builtin"
  }`;

  if (event.code === "400") {
    toBePushed = toBePushed.replace("CODE", event.code);
    toBePushed = toBePushed.replace("TYPE", event.eventType);
    toBePushed = toBePushed.replace("TEXT", event.eventText);
    this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));
  } else {
    toBePushedLoc = toBePushedLoc.replace("CODE", event.code);
    toBePushedLoc = toBePushedLoc.replace("LAT", event.lat);
    toBePushedLoc = toBePushedLoc.replace("LON", event.lon);
    toBePushedLoc = toBePushedLoc.replace("ALT", event.alt);
    toBePushedLoc = toBePushedLoc.replace("ACCURACY", event.accuracy);
    this.resultTemplate.commandQueue.push(JSON.parse(toBePushedLoc));
  }
}

toAlarmTemplateFormat(alarm) {
  let toBePushed = `{
    "messageId": "CODE",
    "values": ["TYPE", "TEXT", ""], "type": "builtin"
  }`;

  toBePushed = toBePushed.replace("CODE", alarm.level);
  toBePushed = toBePushed.replace("TYPE", alarm.alarmType);
  toBePushed = toBePushed.replace("TEXT", alarm.alarmText);
  this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));
}

displayAlarmsOnly() {
  if (this.alarms.length && !this.testArray.length) {
    this.generateAlarms();
  }
}
}
