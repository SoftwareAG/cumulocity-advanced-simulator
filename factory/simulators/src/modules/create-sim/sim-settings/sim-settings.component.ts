import {
  ChangeDetectorRef,
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
import { SimpleChanges } from "@angular/core";
import { UpdateInstructionsService } from "@services/updateInstructions.service";
import { Alert, AlertService } from "@c8y/ngx-components";
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
  smartRestViewModel = {};

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
    if (this.selectedSeries.type === InstructionCategory.SmartRest) {
      console.log(this.selectedSeries);
      this.isSmartRestSelected = true;
      this.smartRestSelectedConfig = this.selectedSeries.config;
      this.smartRestInstruction = this.selectedSeries.instruction;
    }
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
    private smartRESTService: SmartRESTService,
    private alertService: AlertService
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
      case InstructionCategory.SmartRest:
        console.log(this.smartRestSelectedConfig);
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
    this.allInstructionsSeries = [];
    this.smartRestInstructionsArray = this.convertToSmartRestModel(
      this.smartRestInstruction
    );
    const combinedSmartInstruction = {
      instruction: this.smartRestInstruction,
      type: InstructionCategory.SmartRest,
      config: this.smartRestSelectedConfig,
    };
    this.simSettings.allSeries.push(combinedSmartInstruction);
    const cmdQ = this.smartRESTService.generateSmartRestRequest(
      this.smartRestInstructionsArray,
      this.smartRestSelectedConfig
    );

    this.mo.c8y_Series.push(...this.simSettings.allSeries);
    this.commandQueue.push(...cmdQ);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      const alert = {
        text: `Smart REST instructions created successfully.`,
        type: "success",
      } as Alert;
      this.alertService.add(alert);
      this.allInstructionsSeries = res.c8y_Series;
      this.allSeriesEmitter.emit(this.allInstructionsSeries);
      Object.entries(this.smartRestInstruction).forEach(([key, value]) => {
        this.smartRestInstruction[key] = "";
      });
      this.smartRESTService.resetCommandQueueArray();
      this.smartRestArr = [];
      this.smartRestSelectedConfig = "";
      Object.keys(this.smartRestInstruction).forEach(
        (key) => delete this.smartRestInstruction[key]
      );
      this.smartRestInstruction = {};
      this.smartRestInstructionsArray = [];
      this.allInstructionsSeries = [];
    });
  }

  convertToSmartRestModel(smartRestData: {
    [key: string]: number | string;
  }): SmartRestInstruction[] {
    const smartRestInstructionArray: SmartRestInstruction[] = [];
    this.smartRestSelectedConfig.smartRestFields.customValues.forEach(
      (customValue) => {
        let obj: SmartRestInstruction = {
          value: "",
          steps: "",
          type: InstructionCategory.SmartRest,
        };
        Object.entries(smartRestData).forEach(([key, value]) => {
          if (key === customValue.path) {
            obj.value = value as string;
          } else if (key === customValue.path + "_max") {
            obj.maxValue = value as string;
          } else if (key === customValue.path + "_min") {
            obj.minValue = value as string;
          } else if (key === "steps") {
            obj.steps = value as string;
          }
        });

        smartRestInstructionArray.push(obj as SmartRestInstruction);
      }
    );
    return smartRestInstructionArray;
  }
}
