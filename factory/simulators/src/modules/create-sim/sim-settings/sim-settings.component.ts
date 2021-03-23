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
  SleepInstruction,
  SmartRestInstruction,
} from "@models/instruction.model";
import { MeasurementsService } from "@services/measurements.service";
import { ColorsReduced } from "@models/colors.const";
import { CommandQueueEntry } from "@models/commandQueue.model";
import { AlarmsService } from "@services/alarms.service";
import { EventsService } from "@services/events.service";
import { SmartRESTService } from "@services/smartREST.service";
import { Alert, AlertService } from "@c8y/ngx-components";
import { SleepService } from "@services/sleep.service";
import { CustomSimulator } from "@models/simulator.model";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
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
  selectedConfig = '';
  instructionValue: Partial<SeriesInstruction> = {};
  selectedSeries: SeriesInstruction;
  templateCtx: { item: SeriesInstruction };
  isSmartRestSelected = false;
  smartRestViewModel = {};
  randomize = false;

  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;

  @Input() smartRestConfig;
  @Input() id;

  smartRestSelectedConfig;
  smartRestInstructionsArray: SmartRestInstruction[] = [];

  @Input() set series(value: SeriesInstruction) {
    this.selectedSeries = value;
    this.selectedConfig = this.selectedSeries.type;
    this.instructionValue = value;
    this.templateCtx = { item: this.selectedSeries };
    if (this.selectedSeries.type === InstructionCategory.SmartRest) {
      this.isSmartRestSelected = true;
      this.smartRestSelectedConfig = this.selectedSeries.config;
      this.smartRestInstruction = this.selectedSeries.instruction;
    }
  }

  get series() {
    return this.selectedSeries;
  }

  @Input() commandQueue: CommandQueueEntry[];
  @Input() allInstructionsSeries;
  @Input() mo;
  @Output() allSeriesEmitter = new EventEmitter();
  // allInstructionsSeries = [];

  constructor(
    private simService: SimulatorsServiceService,
    private simSettingsService: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private alarmService: AlarmsService,
    private eventsService: EventsService,
    private smartRESTService: SmartRESTService,
    private alertService: AlertService,
    private sleepService: SleepService,
    private updateService: ManagedObjectUpdateService
  ) {}

  ngOnInit() {}

  updateSeries(index: number) {
    for (const entry of this.allForms[index]) {
      if (entry.defaultValue && !this.instructionValue[entry.name]) {
        this.instructionValue[entry.name] = entry.defaultValue;
      }
      if (
        !entry.hidden &&
        entry.required === true &&
        !this.instructionValue[entry.name]
      ) {
        this.alertService.add({
          text: `Not all the required fields are filled.`,
          type: "danger",
        });
        return;
      }
      if (+entry.minimum > this.instructionValue[entry.name]) {
        this.alertService.add({
          text: `For ${entry.name} you need a value greater than or equal to ${entry.minimum}.`,
          type: "danger",
        });
        return;
      }
    }
    this.instructionValue.color = this.selectedColor;
    this.instructionValue.type = this.defaultConfig[index];
    let val = this.instructionValue;
    switch (this.defaultConfig[index]) {
      
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
      case InstructionCategory.Sleep:
        this.sleepService.pushToSleeps(
          this.instructionValue as SleepInstruction
        );
        break;
      case InstructionCategory.SmartRest:
        break;
    }
    const insVal = JSON.parse(JSON.stringify(this.instructionValue));
    this.simSettingsService.pushToInstructionsArray(insVal);
    this.generateRequest();
  }

  generateRequest() {
    this.simSettingsService.randomSelected = this.randomize;
    this.updateService.mo.c8y_DeviceSimulator.commandQueue = this.simSettingsService.generateInstructions();
    this.updateService.mo.c8y_Series.push(...this.simSettingsService.allInstructionsArray);
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {
      console.log(res);
      Object.keys(this.instructionValue).forEach((key) => this.instructionValue[key] = '');
      this.selectedConfig = '';
      Object.keys(this.instructionValue).forEach((key) => delete this.instructionValue[key]);
      this.simSettingsService.resetUsedArrays();
      this.allSeriesEmitter.emit(res.c8y_Series);
    });
  }

  onChangeConfig(value) {
    this.isSmartRestSelected = value === InstructionCategory.SmartRest;
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
    // this.simSettings.allSeries.push(combinedSmartInstruction);
    const cmdQ = this.smartRESTService.generateSmartRestRequest(
      this.smartRestInstructionsArray,
      this.smartRestSelectedConfig
    );

    // this.mo.c8y_Series.push(...this.simSettings.allSeries);
    this.commandQueue.push(...cmdQ);
    this.updateService.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {
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
