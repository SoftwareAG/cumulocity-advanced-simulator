import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { AlertService } from '@c8y/ngx-components';
import { ColorsReduced } from '@models/colors.const';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { DefaultConfig, SeriesMeasurementsForm, SeriesAlarmsForm, SeriesBasicEventsForm, SeriesEventsForm, SeriesSleepForm, InputField } from '@models/inputFields.const';
import { InstructionCategory, SeriesInstruction } from '@models/instruction.model';
import { InstructionService } from '@services/Instruction.service';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-simulator-create',
  templateUrl: './simulator-create.component.html',
  styleUrls: ['./simulator-create.component.scss']
})
export class SimulatorCreateComponent implements OnInit {

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
  @Input() header: TemplateRef<any>;
  subscription = new Subscription();
  allInstructionsSeries: any[];
  isExpanded = true;
  instructionSet: CommandQueueEntry[] = [];
  seriesArray: any[] = [];

  @Output()
  InstructionSeriesEmitter = new EventEmitter();

  constructor(private updateService: ManagedObjectUpdateService,
              private alertService: AlertService,
              private instructionService: InstructionService,
              private simSettingsService: SimulatorSettingsService) { }

  ngOnInit() {
  }

  onChangeConfig(value) {
    this.isSmartRestSelected = value === InstructionCategory.SmartRest;
  }

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
      const assignedIndex: string = this.seriesArray.length.toString();
      const insVal = JSON.parse(JSON.stringify(this.instructionValue));
      this.simSettingsService.pushToInstructionsArray({
        ...insVal,
        index: assignedIndex,
        option: this.measurementOption,
      } as SeriesInstruction);
      
      this.InstructionSeriesEmitter.emit(this.seriesArray);
      this.generateRequest();
    }
  }


  generateRequest() {
    this.instructionValue["scalingOption"] = this.measurementOption;
    this.simSettingsService.randomSelected =
      this.instructionValue.type === "Measurement" &&
      this.instructionValue.scalingOption
        ? this.instructionValue.scalingOption
        : "linear";

    this.instructionSet = this.simSettingsService.generateInstructions();
    
    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        this.simSettingsService.setAllInstructionsSeries(res.c8y_Series);
        this.cleanUp();
      });
  }

  clearSeries() {
    this.selected.selected = false;
    this.instructionValue = {};
    // this.smartRestInstruction = {};
  }

  cleanUp() {
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
    
    this.selectedColor = "#fff";
  }

  updateSeriesColor() {

  }
}
