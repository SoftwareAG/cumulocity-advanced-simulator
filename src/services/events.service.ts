import { Injectable } from '@angular/core';
import { Event } from '@models/events.model';
import { BasicEventInstruction, EventInstruction } from '@models/instruction.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  events = [];

  constructor() {}

  setEvents(events: Event[]) {
    this.events = events;
  }

  pushToEvents(events: EventInstruction | BasicEventInstruction) {
    this.events.push(events);
  }
}
