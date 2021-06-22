import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Alert, AlertService } from '@c8y/ngx-components';
import { IManagedObject } from '@c8y/client';
import { Subscription } from 'rxjs';
import { EditedMeasurement } from 'src/models/editedMeasurement.model';
import { InputField } from '@models/inputFields.models';
import { Instruction, Instruction2, InstructionCategory } from '@models/instruction.model';
import { CommandQueueEntry, IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { InstructionService } from '@services/Instruction.service';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { SmartRESTService } from '@services/smartREST.service';
import {
  DefaultConfig,
  MeasurementsForm,
  AlarmsForm,
  BasicEventsForm,
  EventsForm,
  SleepForm
} from '@constants/inputFields.const';

@Component({
  selector: 'app-edit-instruction',
  templateUrl: './edit-instruction.component.html',
  styleUrls: ['./edit-instruction.component.scss']
})
export class EditInstructionComponent implements OnInit {
  @Input() mo;
  @Input() indexedCommandQueue: IndexedCommandQueueEntry[] = [];
  @Input() edit;
  @Input() displayEditView = false;
  @Input() displayAddView = false;
  smartRestForm: InputField[] = [];
  selectedEditView: string;
  defaultConfig: InstructionCategory[] = DefaultConfig;
  allForms = [MeasurementsForm, AlarmsForm, BasicEventsForm, EventsForm, SleepForm];
  form: InputField[];
  commandQueueEntry: CommandQueueEntry | {};
  instructionValue: Instruction | Instruction2 = {};
  commandQueueEntryIndex: number;
  smartRestSelectedConfig;
  smartRestConfig;
  smartRestInstruction;

  smartConfigSubscription: Subscription;

  toEmit = false;
  edited: EditedMeasurement;
  data: any;

  @Output() updatedVal = new EventEmitter();

  displayInstructionsOrSleep = false;

  constructor(
    private alertService: AlertService,
    private simulatorervice: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService,
    private instructionService: InstructionService,
    private updateService: ManagedObjectUpdateService,
    private smartService: SmartRESTService
  ) {}

  ngOnInit() {
    this.smartConfigSubscription = this.smartService.smartRestUpdate$.subscribe((config) => {
      this.smartRestConfig = config;
    });
  }

  change(val) {
    if (this.displayAddView && this.selectedEditView === 'SmartRest') {
      if (this.allForms.length > this.defaultConfig.length) {
        this.allForms.pop();
      }
    }
  }

  onChangeConfig(value) {
    if (this.displayAddView && this.selectedEditView === 'SmartRest') {
      const temp = this.smartRestSelectedConfig.smartRestFields.customValues;
      this.smartRestInstruction = { type: 'SmartRest' };
      temp.map((entry) => (this.smartRestInstruction[entry.path] = ''));
    }
  }

  addSingleSmartRestInstruction() {
    const smartRestCommandQueueEntry = this.instructionService.smartRestInstructionToCommand(this.smartRestInstruction);
    let indexedCommandQueueEntry = { ...smartRestCommandQueueEntry, index: 'single' };
    if (this.commandQueueEntryIndex) {
      this.indexedCommandQueue.splice(this.commandQueueEntryIndex + 1, 0, indexedCommandQueueEntry);
    } else {
      this.indexedCommandQueue.push(indexedCommandQueueEntry);
    }

    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    this.updateCommandQueueInManagedObject(this.updateService.mo, 'SmartRest');
  }

  addOrUpdateInstruction(index: number) {
    let instructionValue: Instruction | Instruction2 = {};
    for (const entry of this.allForms[index]) {
      if (entry.defaultValue && !this.instructionValue[entry.name]) {
        this.instructionValue[entry.name] = entry.defaultValue;
      }
      if (!entry.hidden && entry.required === true && !this.instructionValue[entry.name]) {
        this.alertService.add({
          text: `Not all the required fields are filled.`,
          type: 'danger'
        });
        return;
      }
      if (+entry.minimum > this.instructionValue[entry.name]) {
        this.alertService.add({
          text: `For ${entry.name} you need a value greater than or equal to ${entry.minimum}.`,
          type: 'danger'
        });
        return;
      }
      instructionValue[entry.name] = this.instructionValue[entry.name];
    }
    instructionValue.type = this.defaultConfig[index];

    const commandQueueEntry = this.instructionService.instructionToCommand(instructionValue as Instruction);

    if (this.displayAddView && this.selectedEditView !== 'SmartRest') {
      let indexedCommandQueueEntry = { ...commandQueueEntry, index: 'single' };
      if (this.commandQueueEntryIndex) {
        this.indexedCommandQueue.splice(this.commandQueueEntryIndex + 1, 0, indexedCommandQueueEntry);
      } else {
        this.indexedCommandQueue.push(indexedCommandQueueEntry);
      }
    } else {
      if (this.edit) {
        let idx = this.edit.index;
        let indexed = { ...commandQueueEntry, index: idx } as IndexedCommandQueueEntry;
        this.indexedCommandQueue[this.commandQueueEntryIndex] = indexed;
      }
    }

    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    this.updateCommandQueueInManagedObject(this.updateService.mo, this.defaultConfig[index]);
  }

  onAddSleep() {
    this.selectedEditView = 'Sleep';
    this.displayAddView = true;
    this.displayEditView = false;
    this.instructionValue = {};
  }

  onAddInstruction() {
    this.selectedEditView = 'Measurement';
    this.displayAddView = true;
    this.displayEditView = false;
    this.instructionValue = {};
  }

  @Input() set editedValue(value: CommandQueueEntry) {
    if (value) {
      this.commandQueueEntryIndex = this.indexedCommandQueue.findIndex((entry) => entry === value);
      const instruction: Instruction = this.instructionService.commandQueueEntryToInstruction(value);
      this.selectedEditView = instruction.type;
      this.instructionValue = instruction;
      if (this.instructionValue.type === InstructionCategory.SmartRest) {
        if (this.allForms.length > this.defaultConfig.length) {
          this.allForms.pop();
        }
        this.smartRestForm = this.instructionService.createSmartRestDynamicForm(this.instructionValue);
        this.allForms.push(this.smartRestForm);
      }
      this.displayAddView = false;
      this.displayEditView = true;
    }
  }

  onDuplicateInstruction() {} // FIXME can be removed?

  onClearAllInstructions() {} // FIXME can be removed?

  updateCurrent(val) {
    this.displayEditView = true;
    this.displayInstructionsOrSleep = false;
  }

  updateCommandQueueInManagedObject(mo: IManagedObject, type: string) {
    this.simulatorervice.updateSimulatorManagedObject(mo).then(
      (res) => {
        const alert = {
          text: `${type} updated successfully.`,
          type: 'success'
        } as Alert;
        this.alertService.add(alert);
      },
      (error) => {
        const alert = {
          text: `Failed to save selected ${type.toLowerCase()}.`,
          type: 'danger'
        } as Alert;
        this.alertService.add(alert);
      }
    );
  }

  ngOnDestroy() {
    if (this.smartConfigSubscription) {
      this.smartConfigSubscription.unsubscribe();
    }
  }
}
