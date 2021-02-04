import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IManagedObject } from "@c8y/client";
import { SimulatorsServiceService } from "../../../services/simulatorsService.service";
import { HelperService } from "../../../services/helper.service";

@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.scss"],
})
export class SimSettingsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private simService: SimulatorsServiceService,
    private helperService: HelperService
  ) {}

  resultTemplate = { commandQueue: [], name: "" };
  displayInstructionsOrSleep = false;
  defaultConfig: string[] = ["Measurements", "Alarms", "Events", "Sleep"];
  selectedConfig: string = this.defaultConfig[0];
  alarmCategories = [
    { category: "Critical", code: "301" },
    { category: "Major", code: "302" },
    { category: "Minor", code: "303" },
  ];
  selectedAlarmCategory = this.alarmCategories[0].category;

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

  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.simulatorName = this.data.simulator.data.c8y_DeviceSimulator.name;
    this.resultTemplate.name = this.data.simulator.data.c8y_DeviceSimulator.name;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    // this.mo.c8y_DeviceSimulator.id = this.mo.id;
  }

  onChangeConfig(val) {
    this.selectedConfig = val;
  }

  onChangeEvent(val) {
    this.selectedEventCategory = val;
  }

  onChangeOfEventConfig(val) {
    this.selectedEventConfig = val;
  }

  addMeasurementToArray(val) {
    this.currentMeasurement = {
      fragment: val.measurement.fragment,
      series: val.measurement.series,
      minValue: val.measurement.minValue,
      maxValue: val.measurement.maxValue,
      steps: val.measurement.steps,
      unit: val.measurement.unit,
      sleep: val.measurement.sleep,
    };
    this.measurements.push(this.currentMeasurement);
    this.newFragmentAdded = true;
  }

  addAlarmToArray(val) {
    this.newFragmentAdded = true;
    this.currentAlarm = {
      level: val.alarm.level,
      alarmText: val.alarm.alarmText,
      alarmType: val.alarm.alarmType,
      steps: val.alarm.alarmSteps,
      sleep: val.alarm.alarmSleep
    };
    this.selectedAlarmConfig = val.alarm.alarmConfig;
    for (let i = 0; i < parseInt(this.currentAlarm.steps); i++) {
      this.alarms.push(this.currentAlarm);
    }

  }

  addEventToArray() {
    switch (this.selectedEventCategory) {
      case this.eventCategories[0].category:
        for (let i = 0; i < parseInt(this.eventSteps); i++) {
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
        for (let i = 0; i < parseInt(this.eventSteps); i++) {
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
    // this.resultTemplate.commandQueue = [];
    if (!this.newFragmentAdded) {
      this.resultTemplate.commandQueue = [];
    }
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
      for (const { temp, index } of this.helperService.scale(
        value.minValue,
        value.maxValue,
        value.steps,
        this.randomSelected
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

      // console.log(this.selectedAlarmConfig);
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
    console.log(this.resultTemplate.commandQueue);
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
    let arr = [];
    let newArr = [];
    let random = false;
    this.testArray.forEach((entry) =>
      arr.push({
        values: this.helperService.scale(entry.minValue, entry.maxValue, entry.steps, false),
        fragment: entry.fragment,
        series: entry.series,
        unit: entry.unit,
      })
    );
    arr.forEach((entry) => {
      entry.values.forEach((val) =>
        newArr.push({
          value: val,
          fragment: entry.fragment,
          series: entry.series,
          unit: entry.unit,
        })
      );
    });
    let arrObj = this.helperService.groupBy(newArr, "fragment");
    let finalArr = [];
    finalArr.push(Object.values(arrObj));
    console.log(finalArr);
    let max = Math.max(...finalArr.map((x) => (x = parseInt(x.length))));
    console.log(max);
    for (let i = 0; i < max; i++) {
      console.log("hh");
      this.helperService.extractArrayValuesByColumn(finalArr, i);
      this.alternateMsmts.push(...this.helperService.extractArrayValuesByColumn(finalArr, i));
    }
    this.alternateMsmts = this.alternateMsmts.filter(
      (entry) => entry !== undefined
    );
    console.log(this.alternateMsmts);
  }

  updateCurrentFragment(val) {
    this.toDisplay = true;
    this.displayEditView = true;
    this.currentIndex = val.index;
    if (val.value.messageId === "200") {
      this.currentMeasurement.fragment = val.value.values[0];
      this.currentMeasurement.series = val.value.values[1];
      this.value = val.value.values[2];
      this.currentMeasurement.unit = val.value.values[3];
      this.editMsmt = {
        msmt: {
          fragment: this.currentMeasurement.fragment,
          series: this.currentMeasurement.series,
          value: this.value,
          unit: this.currentMeasurement.unit,
          msgId: val.value.messageId,
        },
        index: val.index,
      };
    } else if (val.value.messageId.startsWith("30")) {
      this.currentAlarm.alarmType = val.value.values[0];
      this.currentAlarm.alarmText = val.value.values[1];
      this.editMsmt = {
        alarm: {
          alarmType: this.currentAlarm.alarmType,
          alarmText: this.currentAlarm.alarmText,
          msgId: val.value.messageId,
        },
        index: val.index,
      };
    } else if (val.value.messageId.startsWith("40")) {
      this.eventType = val.value.values[0];
      this.eventText = val.value.values[1];
      this.editMsmt = {
        event: {
          eventType: this.eventType,
          eventText: this.eventText,
          msgId: val.value.messageId,
        },
        index: val.index,
      };
    }
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

  onSelectInstructions() {
    this.selectedConfig = this.defaultConfig[0];
    this.displayInstructionsOrSleep = true;
    this.displayEditView = false;
  }

  onSelectSleep() {
    this.selectedConfig = this.defaultConfig[3];
    this.displayInstructionsOrSleep = true;
    this.displayEditView = false;
  }

  displayAlarmsOnly() {
    if (this.alarms.length && !this.testArray.length) {
      this.generateAlarms();
    }
  }

 
}
