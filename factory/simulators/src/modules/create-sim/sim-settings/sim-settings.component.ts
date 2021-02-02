import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IManagedObject } from "@c8y/client";
import { SimulatorsServiceService } from "../../../services/simulatorsService.service";

@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.scss"],
})
export class SimSettingsComponent implements OnInit {
  constructor(private route: ActivatedRoute, private simService: SimulatorsServiceService) {}

  resultTemplate = { commandQueue: [], name: "" };
  displayInstructionsOrSleep = true;
  defaultConfig: string[] = ["Measurements", "Alarms", "Events", "Sleep"];
  alarmCategories = [
    { category: "Critical", code: "301" },
    { category: "Major", code: "302" },
    { category: "Minor", code: "303" },
  ];
  selectedConfig: string = this.defaultConfig[0];
  selectedAlarmCategory = this.alarmCategories[0].category;

  eventCategories = [
    { category: "Basic", code: "400" },
    { category: "Location Update", code: "400" },
    { category: "Location Update Device", code: "400" },
  ];

  measurementOptions = [
    "Measurement series one after another",
    "Alternate measurement series",
  ];
  selectedMsmtOption = this.measurementOptions[0];
  selectedEventCategory = this.eventCategories[0].category;
  measurements = [];
  newFragmentAdded = false;
  alarms: {
    level?: string;
    alarmType: string;
    alarmText: string;
    steps?: string;
  }[] = [];
  events: { code: string; eventType: string; eventText: string; steps: string }[] &
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

  sleep: string;
  fragment: string;
  series: string;
  minVal: string;
  maxVal: string;
  steps: string;
  unit: string;

  alarmType: string;
  alarmText: string;
  alarmSteps: string;

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

  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.simulatorName = this.data.simulator.data.c8y_DeviceSimulator.name;
    this.resultTemplate.name = this.data.simulator.data.c8y_DeviceSimulator.name;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    console.log(this.commandQueue);
  }

  onChangeConfig(val) {
    this.selectedConfig = val;
  }

  onChangeMsmt(val) {
    this.selectedMsmtOption = val;
  }

  onChangeOfAlarm(val) {
    this.selectedAlarmCategory = val;
  }

  onChangeOfAlarmConfig(val) {
    this.selectedAlarmConfig = val;
  }

  onChangeEvent(val) {
    this.selectedEventCategory = val;
  }

  onChangeOfEventConfig(val) {
    this.selectedEventConfig = val;
  }

  addMsmtToArray() {
    this.newFragmentAdded = true;
    this.measurements.push({
      fragment: this.fragment ? this.fragment : "",
      series: this.series ? this.series : "",
      minValue: this.minVal ? this.minVal : "",
      maxValue: this.maxVal ? this.maxVal : "",
      steps: this.steps ? this.steps : "",
      unit: this.unit ? this.unit : "",
      sleep: this.sleep ? this.sleep : "",
    });
    this.fragment = "";
    this.maxVal = "";
    this.minVal = "";
    this.series = "";
    this.steps = "";
    this.unit = "";
  }

  addAlarmToArray() {
    const level = this.alarmCategories.find(
      (entry) => entry.category === this.selectedAlarmCategory
    ).code;
    for (let i=0; i< parseInt(this.alarmSteps); i++) {
    this.alarms.push({
      level: level,
      alarmType: this.alarmType,
      alarmText: this.alarmText,
      steps: this.alarmSteps,
    });
  }
    this.alarmText = "";
    this.alarmType = "";
    this.alarmSteps = "";
  }

  addEventToArray() {
    
    switch (this.selectedEventCategory) {
      case this.eventCategories[0].category:
        for (let i = 0; i < parseInt(this.eventSteps); i++){
        this.events.push({
          code: this.eventCategories[0].code,
          eventType: this.eventType,
          eventText: this.eventText,
          steps: this.eventSteps,
        });
      }
        this.eventText = "";
        this.eventType = "";
        this.eventSteps = "";
        break;

      case this.eventCategories[1].category || this.eventCategories[2].category:
        for (let i = 0; i < parseInt(this.eventSteps); i++){
        this.events.push({
          code: this.eventCategories.find(
            (temp) => temp.category === this.selectedEventCategory
          ).code,
          lat: this.latitude,
          lon: this.longitude,
          alt: this.altitude,
          accuracy: this.accuracy,
          steps: this.eventSteps,
        });
      }
        this.latitude = "";
        this.longitude = "";
        this.altitude = "";
        this.accuracy = "";
        this.eventSteps = "";
        break;
    }
  
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  generateRequest() {
    if (!this.newFragmentAdded) {
      this.resultTemplate.commandQueue = [];
    }
    let allSteps = 0;
    // if (!this.newFragmentAdded) {
    //   this.measurements = [this.deepCopy(this.template)];
    //   // this.measurements.push(this.deepCopy(this.template));
    //   for (let i = 0; i < this.measurements.length; i++) {
    //     let number = this.measurements[i];
    //     this.measurements[i].fragment = this.fragment ? this.fragment : "";
    //     this.measurements[i].series = this.series ? this.series : "";
    //     this.measurements[i].minValue = this.minVal ? this.minVal : "";
    //     this.measurements[i].maxValue = this.maxVal ? this.maxVal : "";
    //     this.measurements[i].steps = this.steps ? this.steps : "";
    //     this.measurements[i].unit = this.unit ? this.unit : "";
    //   }
    // } else {
    //   this.measurements.push({
    //     fragment: this.fragment ? this.fragment : "",
    //     series: this.series ? this.series : "",
    //     minValue: this.minVal ? this.minVal : "",
    //     maxValue: this.maxVal ? this.maxVal : "",
    //     steps: this.steps ? this.steps : "",
    //     unit: this.unit ? this.unit : "",
    //   });
    // }

    for (let value of this.measurements.filter((a) => a.fragment)) {
      allSteps += +value.steps;
      value.steps = +value.steps;
      value.minValue = +value.minValue;
      value.maxValue = +value.maxValue;

      if (this.testArray.find((x) => x.fragment === value.fragment)) {
        const pos = this.testArray.findIndex(
          (x) => x.fragment === value.fragment
        );

        const nowScaled = this.scale(
          value.minValue,
          value.maxValue,
          value.steps
        );
        this.scaledArray[pos].push(...nowScaled);
      } else {
        const nowScaled = this.scale(
          value.minValue,
          value.maxValue,
          value.steps
        );
        this.testArray.push(value);
        this.scaledArray.push(nowScaled);
      }
    }

    // let scaledArray = this.scale(value.minValue, value.maxValue, value.steps);
    for (let value of this.testArray) {
      for (const { temp, index } of this.scale(
        value.minValue,
        value.maxValue,
        value.steps
      ).map((temp, index) => ({ temp, index }))) {
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

        if (this.sleep && this.sleep !== "") {
          this.resultTemplate.commandQueue.push({
            type: "sleep",
            seconds: value.sleep ? value.sleep : this.sleep,
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

      if (this.selectedMsmtOption === this.measurementOptions[1]) {
        this.implementAlternateMsmst();
      }

      // if (
      //   this.alarms &&
      //   this.selectedAlarmConfig === this.alarmConfig[0]
      // ) {
      //   this.generateAlarms();
      // }

      // if (
      //   this.events &&
      //   this.selectedEventConfig === this.eventConfig[0]
      // ) {
      //   this.generateEvents();
      // }
      // this.commandQueue.push(...this.resultTemplate.commandQueue);

      const test = this.scaledArray.map((entry, i) => ({
        data: entry,
        label: this.testArray[i].series,
      }));

      if (this.selectedAlarmConfig === this.alarmConfig[0]) {
          this.generateAlarms();
      }

      if (this.selectedEventConfig === this.eventConfig[0]) {
        console.log(this.events);
        this.generateEvents();
      }

      this.commandQueue.push(...this.resultTemplate.commandQueue);
      this.mo.c8y_DeviceSimulator.commandQueue.push(
        ...this.resultTemplate.commandQueue
      );
      this.simService
        .updateSimulatorManagedObject(this.mo)
        .then((res) => console.log(res));
    }
  }

  scale(min, max, steps) {
    let values = [min];
    if (!this.randomSelected) {
      let calcStep = (max - min) / steps;
      for (let i = 0; i < steps; i++) {
        values.push(+values[i] + calcStep);
      }
    } else {
      for (let i = 1; i < steps; i++) {
        values.push(Math.floor(Math.random() * (max - min)) + min);
      }
    }
    return values;
  }

  generateAlarms() {
    for (let alarm of this.alarms.filter((a) => a.alarmText)) {
      let typeToNumber = { Major: 302, Critical: 301, Minor: 303 };
      this.toAlarmTemplateFormat(alarm);
      if (this.sleep && this.selectedAlarmConfig === this.alarmConfig[0]) {
        this.resultTemplate.commandQueue.push({
          type: "sleep",
          seconds: this.sleep,
        });
      }
    }
  }

  generateEvents() {
    for (let event of this.events) {
      this.toEventTemplateFormat(event);
      if (this.sleep && this.selectedEventConfig === this.eventConfig[0]) {
        this.resultTemplate.commandQueue.push({
          type: "sleep",
          seconds: this.sleep,
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
      console.log(toBePushed);
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
      "messageId": "${
        this.alarmCategories.find(
          (x) => x.category === this.selectedAlarmCategory
        ).code
      }",
      "values": ["TYPE", "TEXT", ""], "type": "builtin"
    }`;

    toBePushed = toBePushed.replace("TYPE", alarm.alarmType);
    toBePushed = toBePushed.replace("TEXT", alarm.alarmText);
    this.resultTemplate.commandQueue.push(JSON.parse(toBePushed));
  }

  implementAlternateMsmst() {
    const arr = [];
    const msmts = [];
    for (let val of this.testArray) {
      arr.push([this.scale(val.minValue, val.maxValue, val.steps)]);
    }
    console.log(arr);
    console.log(Math.max)
    console.log(msmts);
  }
  updateCurrentFragment(val) {
    this.toDisplay = true;
    this.fragment = val.value.values[0];
    this.series = val.value.values[1];
    this.value = val.value.values[2];
    this.unit = val.value.values[3];
    this.currentIndex = val.index;
  }

  updateCommandQueue(newCommandQueue) {
    this.commandQueue = newCommandQueue;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simService
      .updateSimulatorManagedObject(this.mo)
      .then((result) => console.log(result));
  }

  insertSleepOrFragment(current) {
    this.toAddMsmtOrSleep = current.bool;
    this.insertIndex = current.index;
  }

  insertCurrentFragment() {
     {
      let toBePushed = `{
        "messageId": "200",
        "values": ["FRAGMENT", "SERIES", "VALUE", "UNIT"], "type": "builtin"
        }`;

      toBePushed = toBePushed.replace("FRAGMENT", this.fragment);
      toBePushed = toBePushed.replace("SERIES", this.series);
      toBePushed = toBePushed.replace("VALUE", this.value);
      toBePushed = toBePushed.replace("UNIT", this.unit);
      this.commandQueue.splice(this.insertIndex + 1, 0, JSON.parse(toBePushed));
      // TODO: Insert backend call for save here
    }
}

onSelectInstructions() {
  this.selectedConfig = this.defaultConfig[0];
  this.displayInstructionsOrSleep=false;
}
onSelectSleep() {
  this.selectedConfig = this.defaultConfig[3];
  this.displayInstructionsOrSleep = false;
}
}