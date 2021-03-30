import { Component, Input, OnInit } from "@angular/core";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { Subscription } from "rxjs";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import * as _ from "lodash";
import { HelperService } from "@services/helper.service";
import { IndexedCommandQueueEntry } from "@models/commandQueue.model";
import { DragDropSeriesService } from "@services/DragDropSeries.service";
import { UpdateInstructionsService } from "@services/updateInstructions.service";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
@Component({
  selector: "app-series-list",
  templateUrl: "./series-list.component.html",
  styleUrls: ["./series-list.component.less"],
})
export class SeriesListComponent implements OnInit {

  
  allInstructionsSeries;
  @Input() set instructionsSeries(instructionsArray) {
    this.allInstructionsSeries = instructionsArray;
  }

  get instructionsSeries() {
    return this.allInstructionsSeries;
  }
  idxdCmdQueue: IndexedCommandQueueEntry[];
  @Input() set indexedCommandQueue(indexed: IndexedCommandQueueEntry[]) {
    this.idxdCmdQueue = indexed;
  }

  get indexedCommandQueue() {
    return this.idxdCmdQueue;
  }

  private instructionsSeriesSubscription: Subscription;
  constructor(
    private simSettingsService: SimulatorSettingsService,
    private helperService: HelperService, 
    private dragDropService: DragDropSeriesService,
    private updatedService: ManagedObjectUpdateService
  ) {}

  ngOnInit() {
    // this.instructionsSeries = this.simSettingsService.allInstructionsArray;
  }

  ngOnDestroy() {
    if (this.instructionsSeriesSubscription) {
      this.instructionsSeriesSubscription.unsubscribe();
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    const instructionsArray = this.instructionsSeries;
    moveItemInArray(
      this.instructionsSeries,
      event.previousIndex,
      event.currentIndex
    );

    console.log('Instructions series: ', this.instructionsSeries);
    console.log('Indexed command queue: ', this.indexedCommandQueue);
    
    const filtered = this.instructionsSeries.map((entry, idx) => ({
      newIdx: idx.toString(),
      series: entry,
    }));

    console.log('filtered: ', filtered);

    const filteredIndexedCommandQueue = this.indexedCommandQueue.filter((entry) => entry.index !== 'single');
    let rearranged = this.dragDropService.createUpdatedIndexedCommandQueue(filteredIndexedCommandQueue, filtered);

    let singleInstructions = this.dragDropService.createArrayOfSingleInstructions(this.indexedCommandQueue);
    if (singleInstructions.length) {
      singleInstructions.forEach((entry) => {
        rearranged.splice(entry.indexOfPrevious, 0, entry.instruction);
      });
    }
    filtered.forEach((entry) => entry.series.index = entry.newIdx);
    let updatedInstructionsSeries = filtered.map(({newIdx, ...nonIdx}) => nonIdx.series);
    console.log('Updated Instructions Series: ', updatedInstructionsSeries);
    this.indexedCommandQueue = rearranged;
    this.instructionsSeries = updatedInstructionsSeries;
    this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
    this.simSettingsService.setAllInstructionsSeries(updatedInstructionsSeries);
    this.updatedService.updateSimulatorObject(this.updatedService.mo).then((res) => console.log(res));  
  }

  
}
