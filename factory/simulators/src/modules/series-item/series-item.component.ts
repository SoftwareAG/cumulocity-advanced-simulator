import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { CommandQueueEntry } from "@models/commandQueue.model";
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

  @Input() set series(value: SeriesInstruction) {
    console.log(value);
    this.selectedSeries = value;
    this.selectedConfig = this.selectedSeries.type;
    this.instructionValue = value;
    this.setLabelsForSelected();
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
  @Input() mo;
  constructor() {}

  ngOnInit() {}

  setLabelsForSelected() {
    switch (this.selectedSeries.type) {
      case "Measurement":
        this.icon = 'sliders';
        this.form = SeriesMeasurementsForm;
        break;
      case "Alarm":
        this.icon = 'bell-o';
        this.form = SeriesAlarmsForm;
        break;
      case "Sleep":
        this.icon = 'moon-o';
        this.form = SeriesSleepForm;
        break;
      case "BasicEvent":
        this.icon = 'tachometer';
        this.form = SeriesBasicEventsForm;
        break;
      case "LocationUpdateEvent":
        this.icon = 'globe';
        this.form = SeriesEventsForm;
        break;
    }
  }
}
