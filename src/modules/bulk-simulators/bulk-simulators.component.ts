import { Component } from '@angular/core';
import {
  AlarmsForm,
  BasicEventsForm,
  EventsForm,
  InputField,
  SeriesMeasurementsForm,
  SleepForm
} from '@models/inputFields.const';
import {
  InstructionCategory,
  SeriesInstruction,
} from '@models/instruction.model';

@Component({
  selector: 'app-bulk-simulators',
  templateUrl: './bulk-simulators.component.html',
  styleUrls: ['./bulk-simulators.component.scss']
})
export class BulkSimulatorsComponent {
  instructionForms = [SeriesMeasurementsForm, AlarmsForm, BasicEventsForm, EventsForm, SleepForm];
  instructionType = [
    InstructionCategory.Measurement,
    InstructionCategory.Alarm,
    InstructionCategory.BasicEvent,
    InstructionCategory.LocationUpdateEvent,
    InstructionCategory.Sleep
  ];
  instructionValue: Partial<SeriesInstruction> = {};

  selectedInstructioncategory: InputField[] = SeriesMeasurementsForm;
  selectedInstructionType = InstructionCategory.Measurement;
  instructionTemplateList = [];
  instructionSeries: any[] = [];
  // TODO: Type will be fixed once SeriesInstructions type is handled

  constructor() {}


  selectInstructionCategory(i: number) {
    this.selectedInstructionType = this.instructionType[i];
    this.selectedInstructioncategory = this.instructionForms[i];
  }

  addSeries() {
    this.instructionValue['type'] = this.selectedInstructionType;
    this.instructionTemplateList.push(this.instructionValue);
  }

  setInstructionsSeries(event) {
    this.instructionSeries = event;
  }
}
