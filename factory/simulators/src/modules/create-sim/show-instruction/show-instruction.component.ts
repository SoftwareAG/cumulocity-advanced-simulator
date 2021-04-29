import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommandQueueEntry, CommandQueueType, IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { EditedMeasurement } from '@models/editedMeasurement.model';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
// import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { UpdateInstructionsService } from '@services/updateInstructions.service';
import { Subscription } from 'rxjs';
import { ThemeService } from 'ng2-charts';

@Component({
  selector: 'app-show-instruction',
  templateUrl: './show-instruction.component.html',
  styleUrls: ['./show-instruction.component.less']
})
export class ShowInstructionComponent implements OnInit {
  @Input() mo;
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
    this.commandQueueSubscription = this.simSettings.indexedCommandQueueUpdate$.subscribe((indexedCommandQueue: IndexedCommandQueueEntry[]) => {
      this.indexedCommandQueue = indexedCommandQueue;
      this.checkIfAtLeastOneSleepIsSet();
      console.error('commandQueue Change', this.indexedCommandQueue);
    });
  }

  checkIfAtLeastOneSleepIsSet() {
    for (let entry of this.indexedCommandQueue) {
      if (entry.seconds && +entry.seconds >= 5) {
        this.getInvalidSimulator.emit(false);
        this.invalidSimulator = false;
        this.warning = null;
        console.error(this.warning, this.indexedCommandQueue.length);
        return;
      }
    }
    this.warning = {
      title: "Invalid Simulator!",
      message:
      "You need at least a 5 seconds sleep somewhere in the Instruction Queue.",
    };
    console.error(this.warning, this.indexedCommandQueue.length);
    this.getInvalidSimulator.emit(true);
    this.invalidSimulator = true;
  }

  deleteMeasurementOrSleep(item: IndexedCommandQueueEntry) {
    const pos = this.indexedCommandQueue.findIndex((entry) => entry === item);
    
    // Remove series if item is last entry of series
    if (item.index !== 'single') {
      let indexedCommandQueueWithItemIndex = this.indexedCommandQueue.filter((entry) => entry.index === item.index);
      if (indexedCommandQueueWithItemIndex.length && indexedCommandQueueWithItemIndex.length === 1) {
        const updatedInstructionsArray = this.simSettings.allInstructionsArray.filter((series) => series.index !== item.index);
        this.simSettings.setAllInstructionsSeries(updatedInstructionsArray);
      }
    }
    this.indexedCommandQueue.splice(pos, 1);
    this.currentCommandQueue.emit(this.indexedCommandQueue);
    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
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

  drop(event: CdkDragDrop<IndexedCommandQueueEntry[]>) {
    moveItemInArray(
      this.indexedCommandQueue,
      event.previousIndex,
      event.currentIndex
    );

    console.log('Dragged item', this.indexedCommandQueue);
    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => console.log(res));

  }

}
