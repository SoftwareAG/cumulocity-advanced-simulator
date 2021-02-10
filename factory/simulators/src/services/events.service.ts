import { Injectable } from "@angular/core";
import { Event } from '@models/events.model';

@Injectable({
  providedIn: "root",
})
export class EventsService {
  constructor() {}

  events: Event[] = [];
  
  eventConfig = [
    "Generate repeated events",
    "Alternate measurements with events",
  ];
  selectedEventConfig: string = this.eventConfig[0];
  eventCategories = [
    { category: "Basic", code: "400" },
    { category: "Location Update", code: "401" },
    { category: "Location Update Device", code: "402" },
  ];
  selectedEventCategory: string = this.eventCategories[0].category;

  
  setEvents(events: Event[]) {
    this.events = events;
  } 

  generateEvents() {
    // this.currentMeasurement = this.measurementService.uniqueMeasurementsArray[
    //   this.measurementService.uniqueMeasurementsArray.length - 1
    // ];
    let toBePushed = [];
    for (let event of this.events) {
      toBePushed.push(JSON.parse(this.toEventTemplateFormat(event)));
      
      // if (
      //   this.currentMeasurement.sleep &&
      //   this.selectedEventConfig === this.eventConfig[0]
      // ) {
      //   this.resultTemplate.commandQueue.push({
      //     type: "sleep",
      //     seconds: this.currentMeasurement.sleep,
      //   });
      // }
    }
    return toBePushed;
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
      return toBePushed;
    } else {
      toBePushedLoc = toBePushedLoc.replace("CODE", event.code);
      toBePushedLoc = toBePushedLoc.replace("LAT", event.lat);
      toBePushedLoc = toBePushedLoc.replace("LON", event.lon);
      toBePushedLoc = toBePushedLoc.replace("ALT", event.alt);
      toBePushedLoc = toBePushedLoc.replace("ACCURACY", event.accuracy);
      return toBePushedLoc;
    }
  }
}