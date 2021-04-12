import { Injectable } from "@angular/core";
import { CommandQueueEntry } from "@models/commandQueue.model";
import { Event } from "@models/events.model";
import {
  BasicEventInstruction,
  EventInstruction,
} from "@models/instruction.model";

@Injectable({
  providedIn: "root",
})
export class EventsService {
  constructor() {}

  events = [];

  setEvents(events: Event[]) {
    this.events = events;
  }

  pushToEvents(events: EventInstruction | BasicEventInstruction) {
    console.error(events);
    this.events.push(events);
  }
}
