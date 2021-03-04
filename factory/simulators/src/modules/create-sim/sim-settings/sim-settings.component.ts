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
  SmartRestIns,
  SmartRestInstruction,
} from "@models/instruction.model";
import { MeasurementsService } from "@services/measurements.service";
import { ColorsReduced } from "@models/colors.const";
import { CommandQueueEntry } from "@models/commandQueue.model";
import { AlarmsService } from "@services/alarms.service";
import { EventsService } from "@services/events.service";
import { SmartRESTService } from "@services/smartREST.service";
@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.less"],
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
  smartRestInstruction = {};
  smartRestArr = [];
  selectedConfig = this.defaultConfig[0];
  instructionValue: Partial<SeriesInstruction> = {};
  selectedSeries: SeriesInstruction;
  templateCtx: { item: SeriesInstruction };
  isSmartRestSelected = false;
  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;
  @Input() smartRestConfig;
  smartRestSelectedConfig;
  smartRestInstructionsArray: SmartRestInstruction[] = [];

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
    private eventsService: EventsService,
    private smartRESTService: SmartRESTService
  ) {}

  ngOnInit() {}

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
    this.smartRestSelectedConfig = value;
  }

  saveSmartRestTemplateToCommandQueue() {
    const copyOfSmartRestInstruction = JSON.parse(
      JSON.stringify(this.smartRestInstruction)
    );
    console.error(copyOfSmartRestInstruction);
    console.error(this.smartRestSelectedConfig.smartRestFields.customValues);

    Object.entries(copyOfSmartRestInstruction).forEach(([key, value]) => {
      if (
        key.endsWith(".value") ||
        !(
          key.endsWith("value_max") ||
          key.endsWith("value_min") ||
          key === "steps"
        )
      ) {
        this.smartRestArr.push({ [key]: { value: value } });
      }
    });
    console.log(this.smartRestArr);
    Object.entries(copyOfSmartRestInstruction).forEach(([key, value]) => {
      console.log(key);
      const found = this.smartRestArr.find((entry) =>
        key.includes(Object.keys(entry)[0])
      );
      if (found && key.endsWith("_max")) {
        found[Object.keys(found)[0]].maxValue = value;
      }
      if (found && key.endsWith("_min")) {
        found[Object.keys(found)[0]].minValue = value;
      }
    });
    const steps = this.smartRestInstruction["steps"];
    this.smartRestArr.forEach((entry) => {
      entry[Object.keys(entry)[0]].steps = steps;
      entry[Object.keys(entry)[0]].type = InstructionCategory.SmartRest;
    });

    this.smartRestArr.forEach((item) =>
      this.smartRestInstructionsArray.push(
        Object.values(item)[0] as SmartRestInstruction
      )
    );

    console.log(this.smartRestArr);
    const cmdQ = this.smartRESTService.generateSmartRestRequest(
      this.smartRestInstructionsArray,
      this.smartRestSelectedConfig
    );
    this.commandQueue.push(...cmdQ);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      Object.entries(this.smartRestInstruction).forEach(([key, value]) => {
        this.smartRestInstruction[key] = "";
      });
      console.log(this.mo.c8y_DeviceSimulator.commandQueue);
      this.smartRESTService.resetCommandQueueArray();
      this.smartRestArr = [];
      this.smartRestInstructionsArray = [];
    });
  }
}
