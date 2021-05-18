import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SleepService {
  constructor() {}
  sleeps = [];

  pushToSleeps(sleep) {
    this.sleeps.push(sleep);
  }
}
