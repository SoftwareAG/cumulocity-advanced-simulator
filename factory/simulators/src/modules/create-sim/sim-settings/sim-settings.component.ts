import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SimulatorsServiceService } from "../../../services/simulatorsService.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import {
  DefaultConfig,
  SeriesMeasurementsForm,
  SeriesAlarmsForm,
  SeriesBasicEventsForm,
  SeriesEventsForm,
  SeriesSleepForm,
} from "@models/inputFields.const";
import {
  AlarmInstruction,
  BasicEventInstruction,
  SeriesInstruction,
  SeriesMeasurementInstruction,
} from "@models/instruction.model";
import { MeasurementsService } from "@services/measurements.service";
import { ColorsReduced } from "@models/colors.const";
import { CommandQueueEntry } from "@models/commandQueue.model";
import { AlarmsService } from "@services/alarms.service";
import { EventsService } from "@services/events.service";
@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.scss"],
})
export class SimSettingsComponent implements OnInit {
  reducedColors = ColorsReduced;
  selectedColor: string = "#fff";
  defaultConfig: string[] = DefaultConfig;
  allForms = [
    SeriesMeasurementsForm,
    SeriesAlarmsForm,
    SeriesBasicEventsForm,
    SeriesEventsForm,
    SeriesSleepForm,
  ];
  selectedConfig = this.defaultConfig[0];
  instructionValue: Partial<SeriesInstruction> = {};
  selectedSeries: SeriesInstruction;
  selectedCategory: string;

  constructor(
    private route: ActivatedRoute,
    private simService: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private alarmService: AlarmsService,
    private eventsService: EventsService
  ) {}

  updateSeries(index: number) {
    console.log(index, this.instructionValue);
    this.instructionValue.color = this.selectedColor;
    if (this.instructionValue.type === 'Measurement') {
    this.measurementsService.pushToMeasurements(
      this.instructionValue as SeriesMeasurementInstruction
    );
    } else if (this.instructionValue.type === 'Alarm') {
      this.alarmService.pushToAlarms(this.instructionValue as AlarmInstruction);
    } else if (this.instructionValue.type === 'BasicEvent') {
      this.eventsService.pushToEvents(this.instructionValue as BasicEventInstruction);
    }
    this.simSettings.allSeries.push(this.instructionValue);
    this.generateRequest();
  }

  onChange() {
    console.log(this.selectedCategory);
  }

  @Input() commandQueue: CommandQueueEntry[];
  @Input() mo;
  measurementSeries = [];

  generateRequest() {
    const template = this.simSettings.generateRequest();
    this.commandQueue.push(...template);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.mo.c8y_Series.push(...this.simSettings.allSeries);
    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      this.measurementSeries = res.c8y_Series;
      this.simSettings.resetUsedArrays();
    });
  }

  msmt;
  alrm;
  templateCtx;
  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;
  @Input() set series(value: SeriesInstruction) {
    console.error(value);
    this.selectedSeries = value;
    this.instructionValue = value;
    this.templateCtx = { item: this.selectedSeries };
    //this.switchBetweenTypes();
  }

  get series() {
    return this.selectedSeries;
  }

  @Input() set alarm(alarm) {
    if (alarm !== undefined) {
      this.alrm = alarm;
      this.selectedConfig = this.defaultConfig[1];
      this.templateCtx = { item: this.alrm };
    }
  }

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

  onChangeConfig(value) {
    this.selectedConfig = value;
  }

  ngOnInit() {
    // this.mo.c8y_DeviceSimulator.id = this.mo.id;
  }
  /*
  switchBetweenTypes() {
    if (this.selectedSeries.fragment !== undefined && this.selectedSeries.series !== undefined) {
      this.selectedConfig = this.defaultConfig[0];
    } else if (this.selectedSeries.alarmType !== undefined && this.selectedSeries.alarmText !== undefined) {
      this.selectedConfig = this.defaultConfig[1];
    } else if (this.selectedSeries.code !== undefined && this.selectedSeries.eventType !== undefined) {
      this.selectedConfig = this.defaultConfig[2];
    } else if (this.selectedSeries.code !== undefined && this.selectedSeries.geoCoordinate !== undefined) {
      this.selectedConfig = this.defaultConfig[2];
    }

    // TODO: Add checks for Event Location and Location Device Update types
    // TODO: Checks for individual sleep instructions
  }
*/
}
