import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from "@angular/core";
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
  EventInstruction,
  InstructionCategory,
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
  defaultConfig: InstructionCategory[] = DefaultConfig;
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
  templateCtx: { item: SeriesInstruction };
  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;

  @Input() set series(value: SeriesInstruction) {
    console.error(value);
    this.selectedSeries = value;
    this.instructionValue = value;
    this.templateCtx = { item: this.selectedSeries };
  }

  get series() {
    return this.selectedSeries;
  }

  @Input() commandQueue: CommandQueueEntry[];
  @Input() mo;
  @Output() allSeriesEmitter = new EventEmitter();
  allInstructionsSeries = [];

  constructor(
    private simService: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private alarmService: AlarmsService,
    private eventsService: EventsService
  ) {}

  ngOnInit() {
  }

  updateSeries(type) {
    this.instructionValue.type = type;
    switch (type) {
      case InstructionCategory.Measurement:
        this.measurementsService.pushToMeasurements(
          this.instructionValue as SeriesMeasurementInstruction
        );
        break;
      case InstructionCategory.Alarm:
        this.alarmService.pushToAlarms(
          this.instructionValue as AlarmInstruction
        );
        break;
      case InstructionCategory.BasicEvent:
        this.eventsService.pushToEvents(
          this.instructionValue as BasicEventInstruction
        );
        break;
      case InstructionCategory.LocationUpdateEvent:
        this.eventsService.pushToEvents(
          this.instructionValue as EventInstruction
        );
        break;
    }
    this.simSettings.allSeries.push(this.instructionValue);
    this.generateRequest();
  }

  generateRequest() {
    this.allInstructionsSeries = [];
    const template = this.simSettings.generateRequest();
    this.commandQueue.push(...template);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.mo.c8y_Series.push(...this.simSettings.allSeries);
    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      this.allInstructionsSeries = res.c8y_Series;

      // To update measurementSeries instantly once the instruction has been added,
      //  measurementSeries is emitted to the parent

      this.allSeriesEmitter.emit(this.allInstructionsSeries);
      this.simSettings.resetUsedArrays();
      Object.keys(this.instructionValue).forEach(
        (index) => (this.instructionValue[index] = "")
      );
    });
  }

  onChangeConfig(value) {
    this.selectedConfig = value;
  }


}
