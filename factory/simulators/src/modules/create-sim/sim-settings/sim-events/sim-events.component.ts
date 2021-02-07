import { Component, OnInit } from '@angular/core';
import { Event } from '@models/events.model';
import { GeoCoordinate } from '@models/geoCoordinate.model';
import { EventsService } from '@services/events.service';

@Component({
  selector: 'app-sim-events',
  templateUrl: './sim-events.component.html',
  styleUrls: ['./sim-events.component.scss']
})
export class SimEventsComponent implements OnInit {


  eventCategories = [
    { category: "Basic", code: "400" },
    { category: "Location Update", code: "401" },
    { category: "Location Update Device", code: "402" },
  ];
  
  events: Event[] = [];

  protected geoCoordinate: GeoCoordinate = {};

  eventType: string;
  eventText: string;

  eventSteps: string;


  eventConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  
  selectedEventConfig: string = this.eventConfig[0];
  selectedEventCategory = this.eventCategories[0].category;

  constructor(private service: EventsService) { }

  ngOnInit() {
  }

  addEventToArray() {
    if (this.selectedEventCategory === this.eventCategories[0].category){

      for (let i = 0; i < parseInt(this.eventSteps); i++) {
        this.events.push({
          code: this.eventCategories[0].code,
          eventType: this.eventType,
          eventText: this.eventText,
          steps: this.eventSteps,
        });
      }
      this.eventText = "";
      this.eventType = "";
      this.eventSteps = "";
    } else {
      for (let i = 0; i < parseInt(this.eventSteps); i++) {
        this.events.push({
          code: this.eventCategories.find(
            (temp) => temp.category === this.selectedEventCategory
          ).code,
          geoCoordinate: this.geoCoordinate,
          steps: this.eventSteps,
        });
      }
      this.geoCoordinate = {};
      this.eventSteps = "";
      
    }
    
    this.service.setEvents(this.events);
  }


  onChangeEvent(val) {
    this.selectedEventCategory = val;
    this.service.selectedEventCategory = this.selectedEventCategory;
  }

  onChangeOfEventConfig(val) {
    this.selectedEventConfig = val;
    this.service.selectedEventConfig = this.selectedEventConfig;
  }
}
