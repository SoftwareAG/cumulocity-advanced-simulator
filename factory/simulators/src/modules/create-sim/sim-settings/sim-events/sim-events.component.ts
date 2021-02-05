import { Component, OnInit } from '@angular/core';
import { SimulatorSettingsService } from 'src/services/simulatorSettings.service';

@Component({
  selector: 'app-sim-events',
  templateUrl: './sim-events.component.html',
  styleUrls: ['./sim-events.component.scss']
})
export class SimEventsComponent implements OnInit {
  eventCategories = [
    { category: "Basic", code: "400" },
    { category: "Location Update", code: "400" },
    { category: "Location Update Device", code: "400" },
  ];
  events: {
    code: string;
    eventType: string;
    eventText: string;
    steps: string;
  }[] &
    {
      code: string;
      lat: string;
      lon: string;
      alt: string;
      accuracy: string;
      steps: string;
    }[] = [];

  eventType: string;
  eventText: string;

  eventSteps: string;


  eventConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  selectedEventConfig: string = this.eventConfig[0];

  selectedEventCategory = this.eventCategories[0].category;

  constructor(private service: SimulatorSettingsService) { }

  ngOnInit() {
  }

  addEventToArray() {
    switch (this.selectedEventCategory) {
      case this.eventCategories[0].category:
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
        break;

      case this.eventCategories[1].category || this.eventCategories[2].category:
        for (let i = 0; i < parseInt(this.eventSteps); i++) {
          this.events.push({
            code: this.eventCategories.find(
              (temp) => temp.category === this.selectedEventCategory
            ).code,
            lat: this.latitude,
            lon: this.longitude,
            alt: this.altitude,
            accuracy: this.accuracy,
            steps: this.eventSteps,
          });
        }
        this.latitude = "";
        this.longitude = "";
        this.altitude = "";
        this.accuracy = "";
        this.eventSteps = "";
        break;
    }
  }


  onChangeEvent(val) {
    this.selectedEventCategory = val;
  }

  onChangeOfEventConfig(val) {
    this.selectedEventConfig = val;
  }
}
