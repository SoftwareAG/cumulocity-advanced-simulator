import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlarmsService {

constructor() { }
alarms = [];


generateAlarms() {
  for (let alarm of this.alarms.filter((a) => a.alarmText)) {
    let typeToNumber = { Major: 302, Critical: 301, Minor: 303 };
    this.toAlarmTemplateFormat(alarm);
    // if (
    //   alarm.sleep &&
    //   this.selectedAlarmConfig === this.alarmConfig[0]
    // ) {
    //   this.resultTemplate.commandQueue.push({
    //     type: "sleep",
    //     seconds: this.currentAlarm.sleep,
    //   });
    // }
  }
}

toAlarmTemplateFormat(alarm) {
  let toBePushedAlarms = `{
  "messageId": "CODE",
  "values": ["TYPE", "TEXT", ""], "type": "builtin"
}`;

  toBePushedAlarms = toBePushedAlarms.replace("CODE", alarm.level);
  toBePushedAlarms = toBePushedAlarms.replace("TYPE", alarm.alarmType);
  toBePushedAlarms = toBePushedAlarms.replace("TEXT", alarm.alarmText);
  return toBePushedAlarms;
  
}


}
