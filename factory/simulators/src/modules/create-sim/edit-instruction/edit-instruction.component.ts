import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { EditedEvent } from "@models/events.model";
import { IManagedObject } from "@c8y/client";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { EditedMeasurement } from "src/models/editedMeasurement.model";
import { ActivatedRoute } from "@angular/router";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { MeasurementsForm, AlarmsForm, EventsForm, BasicEventsForm, SleepForm, DefaultConfig } from "../../../models/inputFields.const";
import { MeasurementsService } from "@services/measurements.service";
import { ShowInstructionComponent } from "../show-instruction/show-instruction.component";
import { InstructionService } from "@services/Instruction.service";
import { Instruction, Instruction2, InstructionCategory } from "@models/instruction.model";
import { CommandQueueEntry } from "@models/commandQueue.model";

@Component({
  selector: "app-edit-instruction",
  templateUrl: "./edit-instruction.component.html",
  styleUrls: ["./edit-instruction.component.less"],
})
export class EditInstructionComponent implements OnInit {
  @Input() mo;
  @Input() commandQueue: CommandQueueEntry[];
  @Input() displayEditView = false;
  @Input() displayAddView = false;
  selectedEditView: string;
  defaultConfig: InstructionCategory[] = DefaultConfig;
  allForms = [ MeasurementsForm, AlarmsForm, EventsForm, BasicEventsForm, SleepForm ];

  commandQueueEntry: CommandQueueEntry | {};
  instructionValue: Instruction | Instruction2 = {};
  commandQueueEntryIndex: number;


  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private simulatorervice: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private instructionService: InstructionService
  ) { }

  ngOnInit() {
    
  }


  addOrUpdateInstruction(index: number) {
    let instructionValue: Instruction | Instruction2 = {};
    for(const entry of this.allForms[index]){
      if (entry.required === true && !this.instructionValue[entry.name]){
        this.alertService.add({
          text: `Not all required fields are filled.`,
          type: "danger",
        });
        return;
      }
      instructionValue[entry.name] = this.instructionValue[entry.name];
    }
    instructionValue.type = this.defaultConfig[index];
    console.info(this.allForms[index], index, instructionValue);

    const commandQueueEntry = this.instructionService.instructionToCommand(instructionValue as Instruction);
    console.info(this.displayAddView, this.commandQueue, instructionValue, this.commandQueueEntryIndex);
    
    if(this.displayAddView){
      if(this.commandQueueEntryIndex){ 
        this.commandQueue.splice(this.commandQueueEntryIndex, 0, commandQueueEntry);
      }else{
        this.commandQueue.push(commandQueueEntry);
      }
    }else{
      this.commandQueue[this.commandQueueEntryIndex] = commandQueueEntry;
    }

    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, this.defaultConfig[index]);
    this.simSettings.setCommandQueue(this.commandQueue);
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
    console.error('test!!');
    if (value) {
      this.commandQueueEntryIndex = this.commandQueue.findIndex((entry) => entry === value);
      const instruction = this.instructionService.commandQueueEntryToInstruction(value);
      this.selectedEditView = instruction.type;
      this.instructionValue = instruction;
      this.displayAddView = false;
      this.displayEditView = true;
    }
  }

  onDuplicateInstruction() {
    this.commandQueue.splice(this.commandQueueEntryIndex, 0, JSON.parse(JSON.stringify(this.commandQueue[this.commandQueueEntryIndex])));
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, 'Duplication');
    this.simSettings.setCommandQueue(this.commandQueue);
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



  updateCommandQueue(newCommandQueue) {
    this.commandQueue = newCommandQueue;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simulatorervice
      .updateSimulatorManagedObject(this.mo)
      .then((result) => console.log(result));
  }

  updateCommandQueueInManagedObject(mo: IManagedObject, type: string) {
    this.simulatorervice.updateSimulatorManagedObject(mo).then(
      (res) => {
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
}
