import { Component, Input, OnInit } from '@angular/core';
import { CommandQueueEntry, IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-updates',
  templateUrl: './bulk-updates.component.html',
  styleUrls: ['./bulk-updates.component.scss']
})
export class BulkUpdatesComponent implements OnInit {
  mirroredAxis: boolean = false;
  intertwinedValues: boolean = false;
  allInstructionsSeries = [];
  instructionsSubscription: Subscription;
  @Input() mo;


  public indexedCommandQueue: IndexedCommandQueueEntry[] = [];
  private commandQueueSubscription: Subscription;

  constructor(
    private updateService: ManagedObjectUpdateService,
    private simSettings: SimulatorSettingsService) { }

  ngOnDestroy(): void {
    if (this.commandQueueSubscription) {
      this.commandQueueSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.commandQueueSubscription = this.simSettings.indexedCommandQueueUpdate$.subscribe((indexedCommandQueue: IndexedCommandQueueEntry[]) => {
      this.indexedCommandQueue = indexedCommandQueue;
    });

    this.instructionsSubscription = this.simSettings.instructionsSeriesUpdate$.subscribe(
      (instructions) => {
        this.allInstructionsSeries = instructions;
      }
    );


    this.mirroredAxis = this.mo.c8y_mirroredAxis;
    this.intertwinedValues = this.mo.c8y_intertwinedValues;
    this.saltValue = this.mo.c8y_saltValue;

  }



  toggleMirrorYAxis() {
    this.mirroredAxis = !this.mirroredAxis;
    if (this.mirroredAxis) {
      for (let i = this.indexedCommandQueue.length - 1; i >= 0; i--) {
        let newEntry = this.deepCopy(this.indexedCommandQueue[i]);
        newEntry.mirrored = true;
        this.indexedCommandQueue.push(newEntry);
        console.log("newEntry", newEntry);
      }
    } else {
      this.indexedCommandQueue = this.indexedCommandQueue.filter(element => !element.mirrored)
    }
    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);

    this.updateService.mo.c8y_Series = this.simSettings.allInstructionsArray;
    this.updateService.mo.c8y_mirroredAxis = this.mirroredAxis;
    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        console.log(res, "test");
      });
  }


  toggleIntertwineSeries() {
    this.intertwinedValues = !this.intertwinedValues;
    let indexDistribution: { iterations?: number, index: number, count: number, start?: number }[] = [{ index: -1, count: -1 }];
    let newIndexedCommandQueue: IndexedCommandQueueEntry[] = [];
    let filteredCommandQueue = this.indexedCommandQueue.filter(a => a.index === 'single');
    if (this.intertwinedValues === true) {
      let maxIndex = this.allInstructionsSeries.length + 1, numberOfTwines = 0, lastIndex = -1, nextIndex = 1, endCondition = false;
      if (maxIndex <= 2) {
        return;
      }

      for (let entry of this.allInstructionsSeries) {
        indexDistribution.push({ index: +entry.index, count: +entry.steps + 1, iterations: 0 });
        numberOfTwines += +entry.steps + 1;
      }

      let startPosition = 0;
      for (let entry of this.indexedCommandQueue) {
        if (+entry.index !== lastIndex) {
          for (let distributed of indexDistribution) {
            if (distributed.index === +entry.index) {
              distributed.start = startPosition;
            }
          }
          lastIndex = +entry.index;
        }
        startPosition++;
      }

      indexDistribution.sort((a, b) => b.count - a.count);

      for (let i = 0; i < numberOfTwines; i++) {
        for (let distributed of indexDistribution) {
          if (distributed.count <= 0) { continue; }
          newIndexedCommandQueue.push(this.deepCopy(this.indexedCommandQueue[distributed.iterations + distributed.start]));
          distributed.count--;
          distributed.iterations++;
        }
      }
      newIndexedCommandQueue = newIndexedCommandQueue.concat(filteredCommandQueue);

    } else {
      newIndexedCommandQueue = this.indexedCommandQueue;
      newIndexedCommandQueue.sort((a, b) => { return +a.index - +b.index });
    }
    console.error("newCommandQueue", indexDistribution, newIndexedCommandQueue, filteredCommandQueue, this.allInstructionsSeries);

    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(newIndexedCommandQueue);

    this.updateService.mo.c8y_Series = this.simSettings.allInstructionsArray;
    this.updateService.mo.c8y_intertwinedValues = this.intertwinedValues;
    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        console.log(res, "test");
      });
  }

  saltValue: number;
  addSomeSalt() {
    for (let entry of this.indexedCommandQueue) {
      if (entry.deviation) {
        entry.values[2] = String(+entry.values[2] - entry.deviation);
        delete entry.deviation;
      }
      if (entry.index !== 'single' && !entry.deviation && this.saltValue > 0) {
        let percentValue = Math.abs(+entry.values[2] * (this.saltValue / 100));
        entry.deviation = this.randomInterval(-percentValue, percentValue, 2);
        entry.values[2] = String(+entry.values[2] + entry.deviation);
        console.info(percentValue, entry.deviation, entry.values[2]);
      }
    }
    console.log(this.saltValue);
    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);

    this.updateService.mo.c8y_Series = this.simSettings.allInstructionsArray;
    this.updateService.mo.c8y_saltValue = this.saltValue;
    this.updateService
      .updateSimulatorObject(this.updateService.mo)
      .then((res) => {
        console.log(res, "test");
      });
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  randomInterval(min, max, digits) {
    let random = Math.random() * (max - min + 1) + min;
    let powerOfDigits = Math.pow(10, digits);
    return Math.round(random * powerOfDigits) / powerOfDigits;
  }
}
