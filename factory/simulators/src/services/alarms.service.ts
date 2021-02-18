import { Injectable } from '@angular/core';
import { AlarmInstruction } from '@models/instruction.model';
import { CustomSimulator } from '@models/simulator.model';

@Injectable({
  providedIn: 'root'
})
export class AlarmsService {

constructor() { }
alarms = [];
alarmConfig = [
  "Generate repeated alarms",
  "Alternate measurements with alarms",
];
selectedAlarmConfig: string = this.alarmConfig[0];

alarmCategories = [
  { category: "Critical", code: "301" },
  { category: "Major", code: "302" },
  { category: "Minor", code: "303" },
];
selectedAlarmCategory = this.alarmCategories[0].category;
alarmSeries = [];

setAlarms(alarms) {
  this.alarms = alarms;
}

public fetchAlarms(mo: CustomSimulator): Promise<any[]> {
  return new Promise((resolve, reject) => {
    this.alarmSeries = mo.c8y_AlarmSeries;
    resolve(this.alarmSeries);
  });
} 

generateAlarms() {
  let toBePushed = [];
  for (let alarm of this.alarms.filter((a) => a.alarmText)) {
    let typeToNumber = { Major: 302, Critical: 301, Minor: 303 };
    toBePushed.push(JSON.parse(this.toAlarmTemplateFormat(alarm)));
    // FIXME: Add sleep 
    
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
  return toBePushed;
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

pushToAlarms(alarms: AlarmInstruction) {
  console.log(alarms);
  this.alarms.push(alarms);
}


}
