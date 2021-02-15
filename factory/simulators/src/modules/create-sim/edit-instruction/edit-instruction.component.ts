import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { EditedEvent } from "@models/events.model";
import { IManagedObject } from "@c8y/client";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { EditedMeasurement } from "src/models/editedMeasurement.model";
import { ActivatedRoute } from "@angular/router";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { MeasurementsForm, AlarmsForm, EventsForm, BasicEventsForm, SleepForm } from "./inputFields.const";
import { MeasurementsService } from "@services/measurements.service";
import { ShowInstructionComponent } from "../show-instruction/show-instruction.component";
import { InstructionService } from "@services/Instruction.service";
import { Instruction } from "@models/instruction.model";

@Component({
  selector: "app-edit-instruction",
  templateUrl: "./edit-instruction.component.html",
  styleUrls: ["./edit-instruction.component.less"],
})
export class EditInstructionComponent implements OnInit {
  @Input() mo;
  @Input() commandQueue;

  defaultConfig: string[] = ["Measurement", "Alarm", "Event", "BasicEvent", "Sleep"];
  allForms = [ MeasurementsForm, AlarmsForm, EventsForm, BasicEventsForm, SleepForm ]; 
  editedValue = {};
  editedValueIndex: number;


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
    let editedValueCopy: Instruction = { type: this.defaultConfig[index] };
    for(const entry of this.allForms[index]){
      if (entry.required === true && !this.editedValue[entry.name]){
        this.alertService.add({
          text: `Not all required fields are filled.`,
          type: "danger",
        });
        return;
      }
      editedValueCopy[entry.name] = this.editedValue[entry.name];
    }
    console.info(this.allForms[index], index, editedValueCopy);

    const commandQueueEntry = this.instructionService.instructionToCommand(editedValueCopy);
    console.info(this.displayAddView, this.commandQueue, commandQueueEntry, this.editedValueIndex);
    
    if(this.displayAddView){
      this.commandQueue.push(commandQueueEntry);
    }else{
      this.commandQueue[this.editedValueIndex] = commandQueueEntry;
    }

    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.updateCommandQueueInManagedObject(this.mo, this.defaultConfig[index]);
    this.simSettings.setCommandQueue(this.commandQueue);
  }

  displayEditView = false;
  displayAddView = false;
  
  onAddSleep() {
    this.selectedEditView = "Sleep";
    this.displayAddView = true;
    this.displayEditView = false;
    this.editedValue = {};
  }

  onAddInstruction() {
    this.selectedEditView = "Measurement";
    this.displayAddView = true;
    this.displayEditView = false;
    this.editedValue = {};
  }

  @Input() set editedVal(val) {
    if (val) {
      this.editedValueIndex = val['index'];
      const instruction = this.instructionService.commandQueueEntryToInstruction(val['value']);
      this.selectedEditView = instruction.type;
      this.editedValue = instruction;
      this.displayAddView = false;
      this.displayEditView = true;
    }
  }

  onClearAllInstructions() {
    this.commandQueue = [];
  }



  
  selectedEditView: string;
  toEmit = false;
  edited: EditedMeasurement;
  data: any;
  

  get editedVal() {
    return this.editedValue;
  }
  
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
