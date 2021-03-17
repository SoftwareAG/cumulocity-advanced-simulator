import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagedObject } from "@c8y/client";
import { CommandQueueEntry, CommandQueueType } from '@models/commandQueue.model';
import { EditedMeasurement } from '@models/editedMeasurement.model';
import { InputField } from '@models/inputFields.const';
import { InstructionCategory, SmartInstruction } from '@models/instruction.model';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { UpdateInstructionsService } from '@services/updateInstructions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-instruction',
  templateUrl: './show-instruction.component.html',
  styleUrls: ['./show-instruction.component.less']
})
export class ShowInstructionComponent implements OnInit {
  @Input() mo;
  public commandQueue: CommandQueueEntry[] = [];
  private commandQueueSubscription: Subscription;

  editedValue: CommandQueueEntry;
  @Output() currentValue = new EventEmitter<CommandQueueEntry>();
  @Output() currentCommandQueue = new EventEmitter();
  isInserted = false;
  showBtns = false;
  measurement: EditedMeasurement;
  @Output() getInvalidSimulator = new EventEmitter<boolean>();
  invalidSimulator = false;
  warning: { message: string; title: string };

  constructor(
    private service: UpdateInstructionsService,
    private simulatorervice: SimulatorsServiceService,
    private simSettings: SimulatorSettingsService
  ) { }


  ngOnDestroy(): void {
    if (this.commandQueueSubscription) {
      this.commandQueueSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.commandQueueSubscription = this.simSettings.commandQueueUpdate$.subscribe((commandQueue: CommandQueueEntry[]) => {
      this.commandQueue = commandQueue;
      this.checkIfAtLeastOneSleepIsSet();
      console.error('commandQueue Change', JSON.stringify(this.commandQueue));
    });
  }

  checkIfAtLeastOneSleepIsSet() {
    for (let entry of this.commandQueue) {
      if (entry.seconds && +entry.seconds >= 5) {
        this.getInvalidSimulator.emit(false);
        this.invalidSimulator = false;
        this.warning = null;
        return;
      }
    }
    this.warning = {
      title: "Invalid Simulator!",
      message:
        "You need at least a 5 seconds sleep somewhere in the Instruction Queue.",
    };
    this.getInvalidSimulator.emit(true);
    this.invalidSimulator = true;
  }

  deleteMeasurementOrSleep(item) {
    const pos = this.commandQueue.findIndex((entry) => entry === item);
    this.commandQueue.splice(pos, 1);
    this.currentCommandQueue.emit(this.commandQueue);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simulatorervice.updateSimulatorManagedObject(this.mo).then((res) => {
      console.info('deleted entry');
      this.checkIfAtLeastOneSleepIsSet();
      this.simSettings.setCommandQueue(this.commandQueue);
    });
  }

  updateCurrentValue(value) {
    this.editedValue = value;
    this.currentValue.emit(value);
  }

  fetchAddInstructionsOrSleepView() {
    this.service.setInstructionsView(true);
  }

}
