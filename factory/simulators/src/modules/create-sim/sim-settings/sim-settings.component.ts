import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.scss"],
})
export class SimSettingsComponent implements OnInit {
  constructor() {}

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
  alarms: { level: string; type: string; text: string; steps: string;}[] = [];
  events:
     { level: string; type: string; text: string; steps: string; }[]
    & {
        level: string;
        latitude: string;
        longitude: string;
        altitude: string;
        accuracy: string;
        steps: string;
      }[] = [];

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

  ngOnInit() {}

  onChangeConfig(val) {
    this.selectedConfig = val;
  }

  onChangeMsmt(val) {
    this.selectedMsmtOption = val;
  }

  onChangeOfAlarm(val) {
    this.selectedAlarmCategory = val;
  }

  onChangeEvent(val) {
    this.selectedEventCategory = val;
  }

  addMsmtToArray() {
    this.measurements.push({
      fragment: this.fragment ? this.fragment : "",
      series: this.series ? this.series : "",
      minValue: this.minVal ? this.minVal : "",
      maxVal: this.maxVal ? this.maxVal : "",
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
    this.alarms.push({
      level: level,
      type: this.alarmType,
      text: this.alarmText,
      steps: this.alarmSteps,
    });
    this.alarmText = "";
    this.alarmType = "";
    this.alarmSteps = "";
  }

  addEventToArray() {
    switch (this.selectedEventCategory) {
      case this.eventCategories[0].category:
        this.events.push({
          level: this.eventCategories[0].code,
          type: this.eventType,
          text: this.eventText,
          steps: this.eventSteps
        });
        this.eventText = "";
        this.eventType = "";
        break;

      case this.eventCategories[1].category || this.eventCategories[2].category:
        this.events.push({
          level: this.eventCategories.find(
            (temp) => temp.category === this.selectedEventCategory
          ).code,
          latitude: this.latitude,
          longitude: this.longitude,
          altitude: this.altitude,
          accuracy: this.accuracy,
          steps: this.eventSteps
        });
        this.latitude = "";
        this.longitude = "";
        this.altitude = "";
        this.accuracy = "";
        break;
    }
  }
}
