import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SimulatorsServiceService } from "../../../services/simulatorsService.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.scss"],
})
export class SimSettingsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private simService: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService,
  ) {}
  selectedSeries;
  msmt;
  alrm;
  templateCtx;
  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;
  @Input() set series(value) {
    this.selectedSeries = value;
    this.templateCtx={item: this.selectedSeries};
    this.switchBetweenTypes();
  };

  get series() {
    return this.selectedSeries;
  }

  @Input() set alarm(alarm) {
    if (alarm !== undefined) {
    this.alrm = alarm;
    this.selectedConfig = this.defaultConfig[1];
    this.templateCtx={item: this.alrm};}
  };

  get alarm() {
    this.selectedConfig = this.defaultConfig[1];
    return this.alrm;
  }
  // templateCtx = {measurement: this.totalEstimate};
  resultTemplate = { commandQueue: [], name: "" };
  

  newFragmentAdded = false;
  alarms: {
    level?: string;
    alarmType: string;
    alarmText: string;
    steps?: string;
  }[] = [];

  alarmConfig = [
    "Generate repeated alarms",
    "Alternate measurements with alarms",
  ];
  
  selectedAlarmConfig: string = this.alarmConfig[0];

  randomSelected = false;
  simulatorName: string;
  currentIndex: number;
  insertIndex: number;
  toAddMsmtOrSleep = false;
  toDisplay = false;
  defaultConfig: string[] = ["Measurements", "Alarms", "Events", "Sleep"];
  selectedConfig: string = this.defaultConfig[0];


  onChangeConfig(val) {
    this.selectedConfig = val;
  }

  ngOnInit() {
    // this.mo.c8y_DeviceSimulator.id = this.mo.id;
  }

  switchBetweenTypes() {
    if (this.selectedSeries.fragment !== undefined && this.selectedSeries.series !== undefined) {
      this.selectedConfig = this.defaultConfig[0];
    } else if (this.selectedSeries.alarmType !== undefined && this.selectedSeries.alarmText !== undefined) {
      this.selectedConfig = this.defaultConfig[1];
    } else if (this.selectedSeries.code !== undefined && this.selectedSeries.eventType !== undefined) {
      this.selectedConfig = this.defaultConfig[2];
    }

    // TODO: Add checks for Event Location and Location Device Update types
    // TODO: Checks for individual sleep instructions
  }


}
