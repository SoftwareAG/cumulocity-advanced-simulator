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
    return toBePushed;
  }

  toSleepTemplateFormat(sleep: { sleep: string; type: string }) {
    let toBePushedSleep = {
      type: "sleep",
      seconds: parseFloat(sleep.sleep),
    };

    return toBePushedSleep;
  }

  pushToSleeps(sleep) {
    this.sleeps.push(sleep);
  }
}
