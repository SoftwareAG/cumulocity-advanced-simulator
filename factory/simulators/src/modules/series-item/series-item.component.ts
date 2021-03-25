import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from "@angular/core";
import {
  CommandQueueEntry,
  IndexedCommandQueueEntry,
} from "@models/commandQueue.model";
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
import {
  SeriesMeasurementsForm,
  SeriesAlarmsForm,
  SeriesBasicEventsForm,
  SeriesEventsForm,
  SeriesSleepForm,
} from "@models/inputFields.const";
import { InstructionService } from "@services/Instruction.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";

@Component({
  selector: "app-series-item",
  templateUrl: "./series-item.component.html",
  styleUrls: ["./series-item.component.less"],
})
export class SeriesItemComponent implements OnInit {
  selectedSeries: SeriesInstruction;
  selectedConfig: string;
  instructionValue: SeriesInstruction;
  isSmartRestSelected = false;
  smartRestSelectedConfig;
  smartRestInstruction;
  form;
  icon: string;

  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;
  @Input() smartRestConfig;
  @Input() id;
  @Input() index;
  allInstructionsSeries;
  indexedCommandQueue: IndexedCommandQueueEntry[];

  @Input() set series(value: SeriesInstruction) {
    this.selectedSeries = value;
    this.selectedConfig = this.selectedSeries.type;
    this.instructionValue = value;
    this.setLabelsForSelected();
  }

  get series() {
    return this.selectedSeries;
  }

  @Input() commandQueue: CommandQueueEntry[];
  @Input() mo;
  // @Output() deleteInstructionSeries = new EventEmitter();
  constructor(
    private instructionService: InstructionService,
    private simSettingsService: SimulatorSettingsService,
    private updateService: ManagedObjectUpdateService,
  ) {}

  ngOnInit() {}

  setLabelsForSelected() {
    switch (this.selectedSeries.type) {
      case "Measurement":
        this.icon = "sliders";
        this.form = SeriesMeasurementsForm;
        break;
      case "Alarm":
        this.icon = "bell";
        this.form = SeriesAlarmsForm;
        break;
      case "Sleep":
        this.icon = "clock-o";
        this.form = SeriesSleepForm;
        break;
      case "BasicEvent":
        this.icon = "tasks";
        this.form = SeriesBasicEventsForm;
        break;
      case "LocationUpdateEvent":
        this.icon = "globe";
        this.form = SeriesEventsForm;
        break;
      case "SmartRest":
        this.icon = "sitemap";
        this.smartRestSelectedConfig = this.selectedSeries.config;
        this.smartRestInstruction = this.selectedSeries.instruction;
        this.form = this.instructionService.createSmartRestDynamicForm(
          this.smartRestInstruction
        );
        break;
    }
  }

  duplicateSeries() {
    console.log(this.index);
    console.log(this.selectedSeries);
    console.log(this.allInstructionsSeries[this.index]);
  }

  deleteSeries() {
    this.indexedCommandQueue = this.simSettingsService.indexedCommandQueue;
    this.allInstructionsSeries = this.simSettingsService.allInstructionsArray;
    console.log(this.allInstructionsSeries);
    const indexOfItem = this.selectedSeries.index;
    const filtered = this.indexedCommandQueue.filter((entry) => entry.index !== indexOfItem);
    this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(filtered);
    this.allInstructionsSeries = this.allInstructionsSeries.filter((entry) => entry !== this.instructionValue);
    this.simSettingsService.setAllInstructionsSeries(this.allInstructionsSeries);
    this.updateService.updateMOCommandQueueAndIndices(this.simSettingsService.commandQueue, this.simSettingsService.indices);
    this.updateService.updateMOInstructionsArray(this.simSettingsService.allInstructionsArray);
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {console.log(res);
    this.simSettingsService.setAllInstructionsSeries(this.allInstructionsSeries)});
    
  }

  updateSeries() {
   this.indexedCommandQueue = this.simSettingsService.indexedCommandQueue;

   if (this.instructionValue.type !== 'SmartRest') {
     const indexOfSeries = this.selectedSeries.index;
     let itemPos = this.indexedCommandQueue.findIndex((entry) => entry.index === indexOfSeries);
     this.indexedCommandQueue = this.indexedCommandQueue.filter((entry) => entry.index !== indexOfSeries);
     this.instructionService.pushToSeriesArrays(this.instructionValue.type, this.instructionValue);
     let template = this.simSettingsService.generateRequest();
     template.map((entry) => entry.index = indexOfSeries);
     this.indexedCommandQueue.splice(itemPos, 0, ...template);
     this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
     this.updateService.updateMOCommandQueueAndIndices(this.simSettingsService.commandQueue, this.simSettingsService.indices);
     this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => console.log(res));
   }
  }
}
