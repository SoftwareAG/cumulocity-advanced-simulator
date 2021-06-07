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
  InputField,
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
import {
  AdditionalParameter,
  CommandQueueEntry,
  IndexedCommandQueueEntry,
} from "@models/commandQueue.model";
import { AlarmsService } from "@services/alarms.service";
import { EventsService } from "@services/events.service";
import { SmartRESTService } from "@services/smartREST.service";
import { Alert, AlertService } from "@c8y/ngx-components";
import { SleepService } from "@services/sleep.service";
import { CustomSimulator } from "@models/simulator.model";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { InstructionService } from "@services/Instruction.service";
import { FormBuilder } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";
import * as _ from "lodash";
import { SimulatorFileUploadDialog } from "./simulator-file-upload-dialog";
import { Subscription } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-sim-settings",
  templateUrl: "./sim-settings.component.html",
  styleUrls: ["./sim-settings.component.scss"],
})
export class SimSettingsComponent {
  reducedColors = ColorsReduced;
  selectedColor: string = "#fff";
  defaultConfig: InstructionCategory[] = DefaultConfig;
  assignedIndex: string;
  allForms = [
    SeriesMeasurementsForm,
    SeriesAlarmsForm,
    SeriesBasicEventsForm,
    SeriesEventsForm,
    SeriesSleepForm,
  ];
  measurementOptions = ["linear", "random", "wave"];
  // selectedMeasuementOption = this.measurementOptions[0];
  smartRestInstruction = {};
  smartRestArr = [];
  selectedConfig = "";
  instructionValue: Partial<SeriesInstruction> = {};
  selectedSeries: SeriesInstruction;
  templateCtx: { item: SeriesInstruction };
  isSmartRestSelected = false;
  smartRestViewModel = {};
  randomize = false;
  selected = { entryName: "", selected: false };
  validationInstruction: Partial<SeriesInstruction> = {};
  disableBtn = true;
  smartRestOption = "linear";
  measurementOption = "linear";
  subscriptions: Subscription[] = [];
  importUrl;

  smartRestAllValues: { minIncrement?: string, maxIncrement?: string, minimum?: string, maximum?: string, unit?: string } = {};
  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;

  @Input() smartRestConfig;
  @Input() id;

  smartRestSelectedConfig;

  @Input() commandQueue: CommandQueueEntry[];
  @Input() allInstructionsSeries;
  @Input() mo;
  @Output() allSeriesEmitter = new EventEmitter();

  constructor(
    private simSettingsService: SimulatorSettingsService,
    private smartRESTService: SmartRESTService,
    private alertService: AlertService,
    private updateService: ManagedObjectUpdateService,
    private instructionService: InstructionService,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer
  ) {}


  updateSeries(index: number) {
    const isNumArr = this.allForms[index].filter((entry) => entry.isNumber);
    const pos = isNumArr.findIndex((val) =>
      isNaN(Number(this.instructionValue[val.name]))
    );
    if (pos !== -1) {
      this.updateService.simulatorUpdateFeedback(
        "danger",
        "Please fill in numbers for Minimum, Maximum and steps."
      );
    } else {
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

      this.instructionService.pushToSeriesArrays(
        this.defaultConfig[index],
        this.instructionValue
      );
      const assignedIndex: string = this.allInstructionsSeries.length.toString();
      const insVal = JSON.parse(JSON.stringify(this.instructionValue));
      this.simSettingsService.pushToInstructionsArray({
        ...insVal,
        index: assignedIndex,
        option: this.measurementOption,
      } as SeriesInstruction);
      this.generateRequest();
    }
  }


  changeAllSmartRestValues() {
    let currentMinIncrement = 0;
    let currentMaxIncrement = 0;
    for (let entry of this.smartRestSelectedConfig.smartRestFields.customValues) {
        if (this.smartRestAllValues.minimum && entry.path.includes('value')) {
          this.smartRestInstruction[entry.path+'_min'] = String(+this.smartRestAllValues.minimum + currentMinIncrement);
          if (this.smartRestAllValues.maxIncrement){
            currentMaxIncrement += +this.smartRestAllValues.maxIncrement;
          }
        }
        if (this.smartRestAllValues.maximum && entry.path.includes('value')) {
          this.smartRestInstruction[entry.path + '_max'] = String(+this.smartRestAllValues.maximum + currentMaxIncrement);
          if (this.smartRestAllValues.minIncrement){
            currentMinIncrement += +this.smartRestAllValues.minIncrement;
          }
        }
        if (this.smartRestAllValues.unit && entry.path.includes('unit')) {
          this.smartRestInstruction[entry.path] = this.smartRestAllValues.unit;
        }
    }
  }
  
  buttonHandler(inputField: InputField){
    this.instructionValue = this.simSettingsService.buttonHandler(inputField, this.instructionValue, this.allInstructionsSeries);
  }



  generateRequest() {
    this.instructionValue["scalingOption"] = this.measurementOption;
    this.simSettingsService.randomSelected =
      this.instructionValue.type === "Measurement" &&
      this.instructionValue.scalingOption
        ? this.instructionValue.scalingOption
        : "linear";
    let instructionSet = this.simSettingsService.generateInstructions();
    this.updateService.mo.c8y_DeviceSimulator.commandQueue = instructionSet;
    
    //this.updateService.mo.c8y_Indices = this.simSettingsService.getUpdatedIndicesArray().map((entry:AdditionalParameter)=> entry.index);
    this.updateService.mo.c8y_Series = this.simSettingsService.allInstructionsArray;

    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        this.updateService.simulatorUpdateFeedback(
          "success",
          `${this.instructionValue.type} series has been added successfully.`
        );
        Object.keys(this.instructionValue).forEach(
          (key) => (this.instructionValue[key] = "")
        );
        this.selectedConfig = "";
        Object.keys(this.instructionValue).forEach(
          (key) => delete this.instructionValue[key]
        );
        this.simSettingsService.resetUsedArrays();
        this.simSettingsService.setAllInstructionsSeries(res.c8y_Series);
        this.selectedColor = "#fff";
      });
  }

  onSelectFocus(value) {
    this.selected = { entryName: value, selected: false };
  }

  onSelectBlur() {
    this.selected.selected = true;
  }

  onChangeConfig(value) {
    this.isSmartRestSelected = value === InstructionCategory.SmartRest;
  }

  updateSeriesColor() {
    
  }

  openSimulatorUploadFileDialog() {
    const modal = this.modalService.show(SimulatorFileUploadDialog);
    this.subscriptions.push(
      modal.content.closeSubject.subscribe((result: any) => {
        if (result) {
          const fileType = result.name;
          // const data = 
        }
      })
    );
  }

  downloadSimulator() {
    const {id, ...nonId} = this.updateService.mo.c8y_DeviceSimulator;
    let simulatorToImport = (({type, owner, name, c8y_CustomSim, c8y_additionals, c8y_Series}) => ({type, owner, name, c8y_CustomSim, c8y_additionals, c8y_Series})) (this.updateService.mo);
    simulatorToImport['c8y_DeviceSimulator'] = nonId;
    const simulator = JSON.stringify(simulatorToImport);
    const blob = new Blob([simulator as BlobPart], { type: 'application/octet-stream' });
    this.importUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  saveSmartRestTemplateToCommandQueue() {
    this.smartRESTService.smartRestOption =
      this.smartRestOption != "" ? this.smartRestOption : "linear";
    let smartRestInstructionsArray = this.smartRESTService.convertToSmartRestModel(
      this.smartRestInstruction,
      this.smartRestSelectedConfig
    );
    
    let entryFieldsWithInconsistentTypes = [];
    const entriesWithMinMaxOrSteps = Object.keys(
      this.smartRestInstruction
    ).filter((entry) => entry.includes("_min" || "_max" || "steps"));
    if (entriesWithMinMaxOrSteps.length) {
      entryFieldsWithInconsistentTypes = entriesWithMinMaxOrSteps.filter(
        (entry) => isNaN(Number(this.smartRestInstruction[entry]))
      );
    }

    if (entryFieldsWithInconsistentTypes.length) {
      this.updateService.simulatorUpdateFeedback(
        "danger",
        "Please fill in numbers for minimum, maximum and steps"
      );
    } else {
      const copySmartRestInstruction = JSON.parse(
        JSON.stringify(this.smartRestInstruction)
      );
      const copySmartRestSelectedConfig = JSON.parse(
        JSON.stringify(this.smartRestSelectedConfig)
      );

      const smartRestCommandQueue = this.smartRESTService.generateSmartRestRequest(
        smartRestInstructionsArray,
        this.smartRestSelectedConfig
      );
      
      let indexed = this.simSettingsService.indexedCommandQueue;
      const index = this.allInstructionsSeries.length.toString();
      const combinedSmartInstruction: SeriesInstruction = {
        instruction: copySmartRestInstruction,
        type: InstructionCategory.SmartRest,
        config: copySmartRestSelectedConfig,
        index: index,
        option: this.smartRestOption,
      };

      this.simSettingsService.pushToInstructionsArray(combinedSmartInstruction);
      const indexedCmdQ = smartRestCommandQueue.map((entry) => ({
        ...entry,
        index: index,
      })) as IndexedCommandQueueEntry[];
      indexed.push(...indexedCmdQ);
      this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(
        indexed
      );
      this.updateService.mo.c8y_Series = this.simSettingsService.allInstructionsArray;
      this.updateService
        .updateSimulatorObject(this.updateService.mo)
        .then((res) => {
          const alert = {
            text: `Smart REST instructions created successfully.`,
            type: "success",
          } as Alert;
          this.alertService.add(alert);
          this.allSeriesEmitter.emit(res.c8y_Series);
          this.simSettingsService.allInstructionsArray = res.c8y_Series;
          Object.entries(this.smartRestInstruction).forEach(([key, value]) => {
            this.smartRestInstruction[key] = "";
          });
          this.smartRESTService.resetCommandQueueArray();
          this.smartRestArr = [];
          this.smartRestSelectedConfig = "";
          Object.keys(this.smartRestInstruction).forEach(
            (key) => delete this.smartRestInstruction[key]
          );
          this.simSettingsService.resetUsedArrays();
          this.smartRestInstruction = {};
          this.selectedConfig = "";
          this.isSmartRestSelected = false;
        });
    }
  }

  clearSeries() {
    this.selected.selected = false;
    this.instructionValue = {};
    this.smartRestInstruction = {};
  }
}
