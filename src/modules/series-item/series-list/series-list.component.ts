import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { DragDropSeriesService } from '@services/DragDropSeries.service';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-series-list',
  templateUrl: './series-list.component.html',
  styleUrls: ['./series-list.component.scss']
})
export class SeriesListComponent {
  @Input() set instructionsSeries(instructionsArray) {
    this.allInstructionsSeries = instructionsArray;
  }
  get instructionsSeries() {
    return this.allInstructionsSeries;
  }
  @Input() set indexedCommandQueue(indexed: IndexedCommandQueueEntry[]) {
    this.idxdCmdQueue = indexed;
  }
  get indexedCommandQueue() {
    return this.idxdCmdQueue;
  }
  allInstructionsSeries; // FIXME set type
  idxdCmdQueue: IndexedCommandQueueEntry[];

  private instructionsSeriesSubscription: Subscription;
  constructor(
    private simSettingsService: SimulatorSettingsService,
    private dragDropService: DragDropSeriesService,
    private updatedService: ManagedObjectUpdateService
  ) {}

  ngOnDestroy() {
    if (this.instructionsSeriesSubscription) {
      this.instructionsSeriesSubscription.unsubscribe();
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    const instructionsArray = this.instructionsSeries;
    moveItemInArray(this.instructionsSeries, event.previousIndex, event.currentIndex);

    const filtered = this.instructionsSeries.map((entry, idx) => ({
      newIdx: idx.toString(),
      series: entry
    }));
    const filteredIndexedCommandQueue = this.indexedCommandQueue.filter((entry) => entry.index !== 'single');
    let rearranged = this.dragDropService.createUpdatedIndexedCommandQueue(filteredIndexedCommandQueue, filtered);

    let singleInstructions = this.dragDropService.createArrayOfSingleInstructions(this.indexedCommandQueue);
    if (singleInstructions.length) {
      singleInstructions.forEach((entry) => {
        rearranged.splice(entry.indexOfPrevious, 0, entry.instruction);
      });
    }
    filtered.forEach((entry) => (entry.series.index = entry.newIdx));
    let updatedInstructionsSeries = filtered.map(({ newIdx, ...nonIdx }) => nonIdx.series);
    this.indexedCommandQueue = rearranged;
    this.instructionsSeries = updatedInstructionsSeries;
    this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    this.simSettingsService.setAllInstructionsSeries(updatedInstructionsSeries);
    this.updatedService.updateSimulatorObject(this.updatedService.mo).then((res) => {}); // FIXME proper handling
  }
}
