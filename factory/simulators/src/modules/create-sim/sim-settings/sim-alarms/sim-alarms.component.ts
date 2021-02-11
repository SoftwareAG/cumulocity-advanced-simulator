import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AlarmsService } from "@services/alarms.service";

@Component({
  selector: "app-sim-alarms",
  templateUrl: "./sim-alarms.component.html",
  styleUrls: ["./sim-alarms.component.scss"],
})
export class SimAlarmsComponent implements OnInit {
  selectedAlarm;
  isNotFirst = false;
  selectedButton = 'Add Alarm';
  @Input() set alarm(val) {
    if (val !== undefined && val.alarmType !== undefined) { 
    this.selectedAlarm = val;
    this.isNotFirst = true;
    this.alarmType = val.alarmType;
    this.alarmText = val.alarmText;
    this.alarmSteps = val.alarmSteps;
    this.selectedButton = 'Duplicate Alarm'
    }
  }
  get alarm() {
    return this.selectedAlarm;
  }
  @Output() alarmEmitter = new EventEmitter();
  alarmCategories = [
    { category: "Critical", code: "301" },
    { category: "Major", code: "302" },
    { category: "Minor", code: "303" },
  ];
  selectedAlarmCategory = this.alarmCategories[0].category;

  alarmConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  selectedAlarmConfig: string = this.alarmConfig[0];

  alarmType: string;
  alarmText: string;
  alarmSteps: string;
  alarmSleep: string;
  alarms = [];
  currentAlarm: {
    level: string;
    alarmType: string;
    alarmText: string;
    alarmSteps: string;
    alarmSleep?: string;
    alarmConfig: string;
  };
  constructor(private service: AlarmsService) {}

  ngOnInit() {}

  onChangeOfAlarmConfig(val) {
    this.selectedAlarmConfig = val;
    this.service.selectedAlarmConfig = this.selectedAlarmConfig;
  }

  onChangeOfAlarm(val) {
    this.selectedAlarmCategory = val;
    this.service.selectedAlarmCategory = this.selectedAlarmCategory;
  }

  addAlarmToArray() {
    for (let i = 0; i < parseInt(this.alarmSteps); i++) {
      const level = this.alarmCategories.find(
        (entry) => entry.category === this.selectedAlarmCategory
      ).code;
      this.currentAlarm = {
        level: level,
        alarmType: this.alarmType,
        alarmText: this.alarmText,
        alarmSteps: this.alarmSteps,
        alarmSleep: this.alarmSleep,
        alarmConfig: this.selectedAlarmConfig,
      };
      this.service.alarms.push(this.currentAlarm);
    }
    this.alarmText = "";
    this.alarmType = "";
    this.alarmSteps = "";
  }
}
