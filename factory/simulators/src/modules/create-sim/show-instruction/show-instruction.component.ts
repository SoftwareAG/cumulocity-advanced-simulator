import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IManagedObject } from "@c8y/client";
import { CommandQueueEntry, CommandQueueType, IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { EditedMeasurement } from '@models/editedMeasurement.model';
import { InputField } from '@models/inputFields.const';
import { InstructionCategory, SmartInstruction } from '@models/instruction.model';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
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
  public indexedCommandQueue: IndexedCommandQueueEntry[] = [];
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
    private simSettings: SimulatorSettingsService,
    private updateService: ManagedObjectUpdateService
  ) { }


  ngOnDestroy(): void {
    if (this.commandQueueSubscription) {
      this.commandQueueSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.commandQueueSubscription = this.simSettings.indexedCommandQueueUpdate$.subscribe((indexed: IndexedCommandQueueEntry[]) => {
      this.indexedCommandQueue = indexed;
      this.checkIfAtLeastOneSleepIsSet();
      console.error('commandQueue Change', JSON.stringify(this.indexedCommandQueue));
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
    const pos = this.indexedCommandQueue.findIndex((entry) => entry === item);
    this.indexedCommandQueue.splice(pos, 1);
    this.currentCommandQueue.emit(this.indexedCommandQueue);
    let commandQueue = this.simSettings.removeIndicesFromIndexedCommandQueueArray(this.indexedCommandQueue);
    let indices = this.mo.c8y_Indices.splice(pos, 1);
    this.updateService.updateMOCommandQueueAndIndices(commandQueue, indices);
    this.simSettings.updateAll(this.indexedCommandQueue, commandQueue, indices);
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {
      const alertText = `Instruction deleted successfully!`;
      this.updateService.simulatorUpdateFeedback('success', alertText);
      console.info('deleted entry');
      this.checkIfAtLeastOneSleepIsSet();
      this.simSettings.setIndexedCommandQueueUpdate();
    });
  }

  updateCurrentValue(value) {
    this.editedValue = value;
    console.log('display index ',value);
    this.currentValue.emit(value);
  }

  fetchAddInstructionsOrSleepView() {
    this.service.setInstructionsView(true);
  }

}
