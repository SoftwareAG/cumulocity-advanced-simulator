import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagedObject } from "@c8y/client";
import { CommandQueueEntry } from '@models/commandQueue.model';
import { EditedMeasurement } from '@models/editedMeasurement.model';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { UpdateInstructionsService } from '@services/updateInstructions.service';

@Component({
  selector: 'app-show-instruction',
  templateUrl: './show-instruction.component.html',
  styleUrls: ['./show-instruction.component.less']
})
export class ShowInstructionComponent implements OnInit {
  @Input() mo;
  @Input() commandQueue: CommandQueueEntry[];
  editedValue: CommandQueueEntry;
  @Output() currentValue = new EventEmitter<CommandQueueEntry>();
  @Output() currentCommandQueue = new EventEmitter();
  isInserted = false;
  showBtns = false;
  measurement: EditedMeasurement;
  constructor(
    private service: UpdateInstructionsService,
    private simulatorervice: SimulatorsServiceService
  ) { }

  ngOnInit() {
    console.info(this.commandQueue);
  }

  deleteMeasurementOrSleep(item) {
    const pos = this.commandQueue.findIndex((entry) => entry === item);
    this.commandQueue.splice(pos, 1);
    this.currentCommandQueue.emit(this.commandQueue);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simulatorervice.updateSimulatorManagedObject(this.mo).then((res) => {
      console.info('deleted entry');
    });
  }

  updateCurrentValue(value) {
    this.editedValue = value;
    this.currentValue.emit(value);
  }


  fetchAddInstructionsOrSleepView() {
    this.service.setInstructionsView(true);
  }

  ngOnDestroy() {
  }
}
