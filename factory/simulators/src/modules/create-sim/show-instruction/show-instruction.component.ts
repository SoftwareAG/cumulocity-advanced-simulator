import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagedObject } from "@c8y/client";
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { SimulatorsServiceService } from '@services/simulatorsService.service';

@Component({
  selector: 'app-show-instruction',
  templateUrl: './show-instruction.component.html',
  styleUrls: ['./show-instruction.component.scss']
})
export class ShowInstructionComponent implements OnInit {
  displayEditView = false;
  displayInstructionsOrSleep = false;
  editMeasurements;
  @Input() mo: IManagedObject;
  @Output() currentViewState = new EventEmitter();
  commandQueue = [];

  constructor(
    private route: ActivatedRoute,
    private simService: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService) { }

  ngOnInit() {

    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    this.simSettings.setCommandQueue(this.commandQueue);
    // this.mo.c8y_DeviceSimulator.id = this.mo.id;
  }

  updateCurrent(val) {
    this.displayEditView = true;
    this.displayInstructionsOrSleep = false;
    this.editMeasurements = val;
    this.currentViewState.emit({editView: this.displayEditView, instructionsView: this.displayInstructionsOrSleep, editedValue: this.editMeasurements});
  }
  onSelectInstructions() {
//    this.selectedConfig = this.defaultConfig[0];
    this.displayInstructionsOrSleep = true;
    this.displayEditView = false;
  }

  onSelectSleep() {
  //  this.selectedConfig = this.defaultConfig[3];
    this.displayInstructionsOrSleep = true;
    this.displayEditView = false;
  }

  updateCommandQueue(newCommandQueue) {
    this.commandQueue = newCommandQueue;
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simService
      .updateSimulatorManagedObject(this.mo)
      .then((result) => console.log(result));
  }

}
