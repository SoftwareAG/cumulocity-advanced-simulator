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
  @Input() allInstructionsSeries;
  @Input() indexedCommandQueue: IndexedCommandQueueEntry[];

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
    private updateService: ManagedObjectUpdateService
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
    const indexOfItem = this.indexedCommandQueue[this.index].index;
    const filteredIndexedCommandQueue = this.indexedCommandQueue.filter((entry) => entry.index !== indexOfItem);
    let indices = this.simSettingsService.getUpdatedIndicesArray();
    const filteredIndices = indices.filter((entry) => entry !== indexOfItem);
    let commandQueue = this.simSettingsService.removeIndicesFromIndexedCommandQueueArray(
      filteredIndexedCommandQueue
    );
    this.simSettingsService.updateAll(filteredIndexedCommandQueue, commandQueue, filteredIndices);
    this.allInstructionsSeries = this.simSettingsService.allInstructionsArray;
    this.allInstructionsSeries.splice(this.index, 1);
    this.simSettingsService.setAllInstructionsSeries(this.allInstructionsSeries);
    this.simSettingsService.setIndexedCommandQueueUpdate();
    this.updateService.updateMOCommandQueueAndIndices(commandQueue, filteredIndices);
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {
      const alertText = `Instruction series has been deleted successfully.`;
      this.updateService.simulatorUpdateFeedback('success', alertText);
    });
  }
}
