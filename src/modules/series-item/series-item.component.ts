import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import {
  CommandQueueEntry,
  IndexedCommandQueueEntry,
} from '@models/commandQueue.model';
import { SeriesInstruction } from '@models/instruction.model';
import {
  SeriesMeasurementsForm,
  SeriesAlarmsForm,
  SeriesBasicEventsForm,
  SeriesEventsForm,
  SeriesSleepForm,
  InputField,
} from '@models/inputFields.const';
import { InstructionService } from '@services/Instruction.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { SmartRESTService } from '@services/smartREST.service';
import { FormState } from '@models/formstate.model';
import * as _ from 'lodash';

@Component({
  selector: "app-series-item",
  templateUrl: "./series-item.component.html",
  styleUrls: ["./series-item.component.scss"],
})
export class SeriesItemComponent implements OnInit{
  @Input() header: TemplateRef<any>;
  @Input() isExpanded: boolean;
  @Input() smartRestConfig;
  @Input() id;
  @Input() index;
  @Input() commandQueue: CommandQueueEntry[];
  @Input() mo;
  @Input() set series(value: SeriesInstruction) {
    this.selectedSeries = value;
    this.selectedConfig = this.selectedSeries.type;
    this.instructionValue = value;
    this.setLabelsForSelected();
  }
  get series() {
    return this.selectedSeries;
  }
  selectedSeries: any;
  selectedConfig: string;
  instructionValue: SeriesInstruction;
  isSmartRestSelected = false;
  smartRestSelectedConfig;
  smartRestInstruction;
  form;
  icon: string;
  measurementOptions = ['linear', 'random', 'wave'];
  allInstructionsSeries;
  indexedCommandQueue: IndexedCommandQueueEntry[];
  defaultFormState = FormState.PRISTINE;
  formState = this.defaultFormState;

  constructor(
    private instructionService: InstructionService,
    private simSettingsService: SimulatorSettingsService,
    private updateService: ManagedObjectUpdateService,
    private smartRestService: SmartRESTService
  ) {}

  ngOnInit() {
    this.allInstructionsSeries = this.simSettingsService.allInstructionsArray;
  }
  setLabelsForSelected() {
    switch (this.selectedSeries.type) {
      case 'Measurement':
        this.icon = 'sliders';
        this.form = SeriesMeasurementsForm;
        break;
      case 'Alarm':
        this.icon = 'bell';
        this.form = SeriesAlarmsForm;
        break;
      case 'Sleep':
        this.icon = 'clock-o';
        this.form = SeriesSleepForm;
        break;
      case 'BasicEvent':
        this.icon = 'tasks';
        this.form = SeriesBasicEventsForm;
        break;
      case 'LocationUpdateEvent':
        this.icon = 'globe';
        this.form = SeriesEventsForm;
        break;
      case 'SmartRest':
        this.icon = 'sitemap';
        this.smartRestSelectedConfig = this.selectedSeries.config;
        this.smartRestInstruction = this.selectedSeries.instruction;
        this.form = this.instructionService.createSmartRestDynamicForm(
          this.smartRestInstruction
        );
        break;
    }
  }

  duplicateSeries() {
    const duplicated = _.cloneDeep(this.selectedSeries);
    this.allInstructionsSeries = this.simSettingsService.allInstructionsArray;
    duplicated.index = this.allInstructionsSeries.length.toString();
    const indexOfSeries = duplicated.index;
    this.indexedCommandQueue = this.simSettingsService.indexedCommandQueue;
    this.allInstructionsSeries.push(duplicated);
    if (this.instructionValue.type !== 'SmartRest') {
      this.instructionService.pushToSeriesArrays(duplicated.type, duplicated);
      let template = this.simSettingsService.generateRequest();
      template.map((entry) => (entry.index = indexOfSeries));
      this.indexedCommandQueue.push(...template);
    } else {
      let smartRestInstructionsArray = this.smartRestService.convertToSmartRestModel(
        duplicated.instruction,
        duplicated.config
      );
      let cmdQ = this.smartRestService.generateSmartRestRequest(
        smartRestInstructionsArray,
        this.selectedSeries.config
      );
      const indexedCmdQ = cmdQ.map((entry) => ({
        ...entry,
        index: indexOfSeries,
      })) as IndexedCommandQueueEntry[];
      this.indexedCommandQueue.push(...indexedCmdQ);
    }
    this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(
      this.indexedCommandQueue
    );
    this.simSettingsService.setAllInstructionsSeries(
      this.allInstructionsSeries
    );
    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        this.updateService.simulatorUpdateFeedback(
          'success',
          'Series successfully duplicated.'
        );
      });
  }

  deleteSeries() {
    this.indexedCommandQueue = this.simSettingsService.indexedCommandQueue;
    this.allInstructionsSeries = this.simSettingsService.allInstructionsArray;
    const indexOfItem = +this.selectedSeries.index;
    const filtered = this.indexedCommandQueue.filter(
      (entry: IndexedCommandQueueEntry) => +entry.index !== +indexOfItem
    );

    this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(
      filtered
    );
    this.allInstructionsSeries = this.allInstructionsSeries.filter(
      (entry) => entry.index !== this.selectedSeries.index
    );
    this.simSettingsService.setAllInstructionsSeries(
      this.allInstructionsSeries
    );
    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        const alertText = `Series has been deleted succesfully.`;
        this.updateService.simulatorUpdateFeedback('success', alertText);
      });
  }

  buttonHandler(inputField: InputField) {
    this.instructionValue = this.simSettingsService.buttonHandler(inputField, this.instructionValue, this.allInstructionsSeries) as SeriesInstruction;
  }

  updateSeries() {
    this.simSettingsService.randomSelected =
      this.selectedSeries.type === 'Measurement' ||
      this.selectedSeries.type === 'SmartRest'
        ? this.selectedSeries.option
        : null;
    this.indexedCommandQueue = this.simSettingsService.indexedCommandQueue;
    const indexOfSeries = this.selectedSeries.index;
    let itemPos = this.indexedCommandQueue.findIndex(
      (entry) => entry.index === indexOfSeries
    );
    this.indexedCommandQueue = this.indexedCommandQueue.filter(
      (entry) => entry.index !== indexOfSeries
    );

    if (this.instructionValue.type !== 'SmartRest') {
      this.simSettingsService.randomSelected = this.selectedSeries.option;
      this.instructionService.pushToSeriesArrays(
        this.instructionValue.type,
        this.instructionValue
      );
      let template = this.simSettingsService.generateRequest();
      template.map((entry) => (entry.index = indexOfSeries));
      this.indexedCommandQueue.splice(itemPos, 0, ...template);
    } else {
      this.smartRestService.smartRestOption = this.selectedSeries.option;
      let smartRestInstructionsArray = this.smartRestService.convertToSmartRestModel(
        this.selectedSeries.instruction,
        this.selectedSeries.config
      );
      let cmdQ = this.smartRestService.generateSmartRestRequest(
        smartRestInstructionsArray,
        this.selectedSeries.config
      );
      const indexedCmdQ = cmdQ.map((entry) => ({
        ...entry,
        index: indexOfSeries,
      })) as IndexedCommandQueueEntry[];
      this.indexedCommandQueue.splice(itemPos, 0, ...indexedCmdQ);
    }
    this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(
      this.indexedCommandQueue
    );
    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        const alertText = `Series has been updated successfully.`;
        this.updateService.simulatorUpdateFeedback('success', alertText);
        this.formState = this.defaultFormState;
      });
  }

  inputChange(event: Event): FormState {
    // FIXME use form-element and provided form-state
    this.formState = FormState.TOUCHED;
    return this.formState;
  }
}
