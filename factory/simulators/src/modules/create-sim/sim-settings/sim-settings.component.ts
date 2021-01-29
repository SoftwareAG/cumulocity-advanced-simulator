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

  selectedEventCategory = this.eventCategories[0].category;
  ngOnInit() {}

  onChangeConfig(val) {
    this.selectedConfig = val;
  }

  onChangeOfAlarm(val) {
    this.selectedAlarmCategory = val;
  }

  onChangeEvent(val) {
    this.selectedEventCategory = val;
  }
}
