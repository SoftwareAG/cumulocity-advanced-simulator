import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SleepService {
  constructor() {}
  sleeps = [];

  generateSleep() {
    let toBePushed = [];
    for (let sleep of this.sleeps) {
      toBePushed.push((this.toSleepTemplateFormat(sleep)));
    }
    return toBePushed[0];
  }

  toSleepTemplateFormat(sleep) {
    let toBePushedSleep = {
      type: "sleep",
      seconds: Number(sleep.seconds),
    };
    return toBePushedSleep;
  }

  pushToSleeps(sleep) {
    this.sleeps.push(sleep);
  }
}
