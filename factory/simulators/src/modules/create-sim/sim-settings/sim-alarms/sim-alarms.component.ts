import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AlarmsService } from '@services/alarms.service';

@Component({
  selector: 'app-sim-alarms',
  templateUrl: './sim-alarms.component.html',
  styleUrls: ['./sim-alarms.component.scss']
})
export class SimAlarmsComponent implements OnInit {

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
  currentAlarm: {level: string; alarmType: string; alarmText: string; alarmSteps: string; alarmSleep?: string; alarmConfig: string;};
  constructor(private service: AlarmsService) { }

  ngOnInit() {
  }

  
  onChangeOfAlarmConfig(val) {
    this.selectedAlarmConfig = val;
  }

  
  onChangeOfAlarm(val) {
    this.selectedAlarmCategory = val;
  }

  addAlarmToArray() {
    const level = this.alarmCategories.find(
      (entry) => entry.category === this.selectedAlarmCategory
    ).code;
    this.currentAlarm = {
      level: level,
      alarmType: this.alarmType,
      alarmText: this.alarmText,
      alarmSteps: this.alarmSteps,
      alarmSleep: this.alarmSleep,
      alarmConfig: this.selectedAlarmConfig
    };
    this.alarms.push(this.currentAlarm);
    this.service.setAlarms(this.alarms);
    this.alarmText = "";
    this.alarmType = "";
    this.alarmSteps = "";
  }



}
