import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { EditedEvent } from "@models/events.model";
import { IManagedObject } from "@c8y/client";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { EditedMeasurement } from "src/models/editedMeasurement.model";
import { ActivatedRoute } from "@angular/router";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { MeasurementsForm, AlarmsForm, EventsForm, BasicEventsForm, SleepForm, DefaultConfig, InputField } from "../../../models/inputFields.const";
import { MeasurementsService } from "@services/measurements.service";
import { ShowInstructionComponent } from "../show-instruction/show-instruction.component";
import { InstructionService } from "@services/Instruction.service";
import { Instruction, Instruction2, InstructionCategory } from "@models/instruction.model";
import { CommandQueueEntry, IndexedCommandQueueEntry } from "@models/commandQueue.model";
import { UpdateInstructionsService } from "@services/updateInstructions.service";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { Subscription } from "rxjs";
import { SmartRESTService } from "@services/smartREST.service";
// import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";

@Component({
  selector: "app-edit-instruction",
  templateUrl: "./edit-instruction.component.html",
  styleUrls: ["./edit-instruction.component.less"],
})
export class EditInstructionComponent implements OnInit {
  @Input() mo;
  @Input() indexedCommandQueue : IndexedCommandQueueEntry[];
  @Input() edit;
  @Input() displayEditView = false;
  @Input() displayAddView = true;
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


  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private simulatorervice: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private instructionService: InstructionService,
    private updateInstructionService: UpdateInstructionsService,
    private updateService: ManagedObjectUpdateService,
    private smartService: SmartRESTService
  ) { }

  ngOnInit() {
    this.smartConfigSubscription = this.smartService.smartRestUpdate$.subscribe((config) => {this.smartRestConfig = config});
  }

  change(val) {
    if (this.displayAddView && this.selectedEditView ==='SmartRest') {
      if (this.allForms.length > this.defaultConfig.length) {
        this.allForms.pop();
      }
      console.log('Smart Rest', this.instructionValue);
    }
  }

  onChangeConfig(value) {
    if (this.displayAddView && this.selectedEditView ==='SmartRest') {
      const temp =  this.smartRestSelectedConfig.smartRestFields.customValues;
      this.smartRestInstruction = {type: 'SmartRest'};
      temp.map((entry) => this.smartRestInstruction[entry.path] = '');
    }
  }

  addSingleSmartRestInstruction() {
    const smartRestCommandQueueEntry = this.instructionService.smartRestInstructionToCommand(this.smartRestInstruction);
    let indexedCommandQueueEntry = {...smartRestCommandQueueEntry, index: 'single'};
      if(this.commandQueueEntryIndex){ 
        
        this.indexedCommandQueue.splice(this.commandQueueEntryIndex+1, 0, indexedCommandQueueEntry);
      }else{
        this.indexedCommandQueue.push(indexedCommandQueueEntry);
      }

      this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    this.updateCommandQueueInManagedObject(this.updateService.mo, 'SmartRest');
  }


  addOrUpdateInstruction(index: number) {
    let instructionValue: Instruction | Instruction2 = {};
    for(const entry of this.allForms[index]){
      if (entry.defaultValue && !this.instructionValue[entry.name]){
        this.instructionValue[entry.name] = entry.defaultValue;
      }
      if (!entry.hidden && entry.required === true && !this.instructionValue[entry.name]){
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
      instructionValue[entry.name] = this.instructionValue[entry.name];
    }
    instructionValue.type = this.defaultConfig[index];
    console.info(this.allForms[index], index, instructionValue);

    console.log(instructionValue);
    const commandQueueEntry = this.instructionService.instructionToCommand(instructionValue as Instruction);
    console.info(this.displayAddView, this.indexedCommandQueue, instructionValue, this.commandQueueEntryIndex);
    
    if(this.displayAddView && this.selectedEditView !== 'SmartRest'){
      let indexedCommandQueueEntry = {...commandQueueEntry, index: 'single'};
      if(this.commandQueueEntryIndex){ 
        
        this.indexedCommandQueue.splice(this.commandQueueEntryIndex+1, 0, indexedCommandQueueEntry);
      }else{
        this.indexedCommandQueue.push(indexedCommandQueueEntry);
      }
    }else{
      if (this.edit) {
        let idx = this.edit.index;
        let indexed = {...commandQueueEntry, index : idx} as IndexedCommandQueueEntry;
        this.indexedCommandQueue[this.commandQueueEntryIndex] = indexed;
        console.log('Index ', this.indexedCommandQueue[this.commandQueueEntryIndex]);
      }
      
    }

    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    this.updateCommandQueueInManagedObject(this.updateService.mo, this.defaultConfig[index]);
  }

  
  
  onAddSleep() {
    this.selectedEditView = "Sleep";
    this.displayAddView = true;
    this.displayEditView = false;
    this.instructionValue = {};
  }

  onAddInstruction() {
    this.selectedEditView = "Measurement";
    this.displayAddView = true;
    this.displayEditView = false;
    this.instructionValue = {};
    
  }

  @Input() set editedValue(value: CommandQueueEntry) {
    if (value) {

      this.commandQueueEntryIndex = this.indexedCommandQueue.findIndex((entry) => entry === value);
      const instruction: Instruction = this.instructionService.commandQueueEntryToInstruction(value);
      console.log(instruction);
      console.log('test!!', value, instruction);
      this.selectedEditView = instruction.type;
      this.instructionValue = instruction;
      console.log(this.instructionValue);
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

  onDuplicateInstruction() {
    this.indexedCommandQueue.splice(this.commandQueueEntryIndex, 0, JSON.parse(JSON.stringify(this.indexedCommandQueue[this.commandQueueEntryIndex])));
    let updatedCommandQueue = this.simSettings.removeIndicesFromIndexedCommandQueueArray(this.indexedCommandQueue);
    let indices = this.updateService.mo.c8y_Indices;
    indices.splice(this.commandQueueEntryIndex, 0, this.indexedCommandQueue[this.commandQueueEntryIndex].index);
    this.updateService.updateMOCommandQueueAndIndices(updatedCommandQueue, indices);
    this.simSettings.updateAll(this.indexedCommandQueue, updatedCommandQueue, this.updateService.mo.c8y_Indices);
    this.updateCommandQueueInManagedObject(this.updateService.mo, 'Duplication');
    this.simSettings.setIndexedCommandQueueUpdate();
  }

  onClearAllInstructions() {}

  toEmit = false;
  edited: EditedMeasurement;
  data: any;
  
  @Output() updatedVal = new EventEmitter();


  displayInstructionsOrSleep = false;


  updateCurrent(val) {
    this.displayEditView = true;
    this.displayInstructionsOrSleep = false;
  }



  // updateCommandQueue(newCommandQueue) {
  //   this.indexedCommandQueue = newCommandQueue;
  //   this.updateService.mo.c8y_DeviceSimulator.commandQueue = this.indexedCommandQueue;
  //   this.simulatorervice
  //     .updateSimulatorManagedObject(this.updateService.mo)
  //     .then((result) => console.log(result));
  // }

  updateCommandQueueInManagedObject(mo: IManagedObject, type: string) {
    this.simulatorervice.updateSimulatorManagedObject(mo).then(
      (res) => {
        console.log(res);
        const alert = {
          text: `${type} updated successfully.`,
          type: "success",
        } as Alert;
        this.alertService.add(alert);
      },
      (error) => {
        const alert = {
          text: `Failed to save selected ${type.toLowerCase()}.`,
          type: "danger",
        } as Alert;
        this.alertService.add(alert);
      }
      
    );

    
  }

  ngOnDestroy() {
    if(this.smartConfigSubscription) {
      this.smartConfigSubscription.unsubscribe();
    }
  }
}
