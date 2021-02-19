import { Component, Input, OnInit } from "@angular/core";
import { Event } from "@models/events.model";
import { GeoCoordinate } from "@models/geoCoordinate.model";
import { EventsService } from "@services/events.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";

@Component({
  selector: "app-sim-events",
  templateUrl: "./sim-events.component.html",
  styleUrls: ["./sim-events.component.scss"],
})
export class SimEventsComponent implements OnInit {
  selectedEvent;
  @Input() set seriesVal(event) {
    if (event !== undefined && event.code !== undefined) {
      this.selectedEvent = event;
      this.selectedEventCategory = this.eventCategories.filter((x) => x.code===event.code)[0].category;
      this.eventSteps = event.steps;
      if (event.code=== '400') {
      this.eventType = event.eventType;
      this.eventText = event.eventText;
      
      } else {
        this.geoCoordinate.latitude = event.geoCoordinate.latitude;
        this.geoCoordinate.longitude = event.geoCoordinate.longitude;
        this.geoCoordinate.altitude = event.geoCoordinate.altitude;
        this.geoCoordinate.accuracy = event.geoCoordinate.accuracy;
      }
    }

  }

  get seriesVal() {
    return this.selectedEvent;
  }

  eventCategories = [
    { category: "Basic", code: "400" },
    { category: "Location Update", code: "401" },
    { category: "Location Update Device", code: "402" },
  ];

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

  constructor(
    private service: EventsService,
    private simService: SimulatorSettingsService
  ) {}

  ngOnInit() {}

  addEventToArray() {
    if (this.selectedEventCategory === this.eventCategories[0].category) {
      for (let i = 0; i < parseInt(this.eventSteps); i++) {
        this.service.events.push({
          eventCategory: this.eventCategories[0].code,
          eventType: this.eventType,
          eventText: this.eventText,
          steps: this.eventSteps,
        });
      }
      this.simService.allSeries.push({
        code: this.eventCategories[0].code,
        eventType: this.eventType,
        eventText: this.eventText,
        steps: this.eventSteps,
      });
      this.eventText = "";
      this.eventType = "";
      this.eventSteps = "";
    } else {
      for (let i = 0; i < parseInt(this.eventSteps); i++) {
        this.service.events.push({
          eventCategory: this.eventCategories.find(
            (temp) => temp.category === this.selectedEventCategory
          ).code,
          geoCoordinate: this.geoCoordinate,
          steps: this.eventSteps,
        });
      }
      this.simService.allSeries.push({
        code: this.eventCategories.find(
          (temp) => temp.category === this.selectedEventCategory
        ).code,
        geoCoordinate: this.geoCoordinate,
        steps: this.eventSteps,
      });
      this.geoCoordinate = {};
      this.eventSteps = "";
    }
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
