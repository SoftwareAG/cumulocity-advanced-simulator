import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IndexedCommandQueueEntry, MessageIds } from '@models/commandQueue.model';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-bulk-updates',
  templateUrl: './bulk-updates.component.html',
  styleUrls: ['./bulk-updates.component.scss']
})
export class BulkUpdatesComponent implements OnInit {
  mirroredAxis: boolean = false;
  intertwinedValues: boolean = false;
  randomizeValueType: 'All' | 'SmartRest' | 'Measurements' = 'All';
  allInstructionsSeries = [];
  instructionsSubscription: Subscription;
  @Input() mo;

  public indexedCommandQueue: IndexedCommandQueueEntry[] = [];
  private commandQueueSubscription: Subscription;

  constructor(private updateService: ManagedObjectUpdateService, private simSettings: SimulatorSettingsService) {}

  ngOnDestroy(): void {
    if (this.commandQueueSubscription) {
      this.commandQueueSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.commandQueueSubscription = this.simSettings.indexedCommandQueueUpdate$.subscribe(
      (indexedCommandQueue: IndexedCommandQueueEntry[]) => {
        this.indexedCommandQueue = indexedCommandQueue;
      }
    );

    this.instructionsSubscription = this.simSettings.instructionsSeriesUpdate$.subscribe((instructions) => {
      this.allInstructionsSeries = instructions;
    });

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
      }
    } else {
      this.indexedCommandQueue = this.indexedCommandQueue.filter((element) => !element.mirrored);
    }
    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);

    this.updateService.mo.c8y_Series = this.simSettings.allInstructionsArray;
    this.updateService.mo.c8y_mirroredAxis = this.mirroredAxis;
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {});
  }

  toggleIntertwineSeries() {
    this.intertwinedValues = !this.intertwinedValues;
    let indexDistribution: { iterations?: number; index: number; count: number; start?: number }[] = [
      { index: -1, count: -1 }
    ];
    let newIndexedCommandQueue: IndexedCommandQueueEntry[] = [];
    let filteredCommandQueue = this.indexedCommandQueue.filter((a) => a.index === 'single');
    if (this.intertwinedValues === true) {
      let maxIndex = this.allInstructionsSeries.length + 1,
        numberOfTwines = 0,
        lastIndex = -1,
        nextIndex = 1,
        endCondition = false;
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
          if (distributed.count <= 0) {
            continue;
          }
          newIndexedCommandQueue.push(
            this.deepCopy(this.indexedCommandQueue[distributed.iterations + distributed.start])
          );
          distributed.count--;
          distributed.iterations++;
        }
      }
      newIndexedCommandQueue = newIndexedCommandQueue.concat(filteredCommandQueue);
    } else {
      newIndexedCommandQueue = this.indexedCommandQueue;
      newIndexedCommandQueue.sort((a, b) => {
        return +a.index - +b.index;
      });
    }

    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(newIndexedCommandQueue);

    this.updateService.mo.c8y_Series = this.simSettings.allInstructionsArray;
    this.updateService.mo.c8y_intertwinedValues = this.intertwinedValues;
    this.updateService.updateSimulatorObject(this.updateService.mo);
  }

  saltValue: number;
  addSomeSalt() {
    for (let entry of this.indexedCommandQueue) {
      //removes old salt if possible
      if (entry.deviation && entry.deviation.length > 0) {
        for (let i = 0; i < entry.values.length; i++) {
          let number = entry.values[i];
          if (number && !Number.isNaN(+number)) {
            entry.values[i] = String(+number - entry.deviation.shift());
          }
        }
      }
      delete entry.deviation;
      //calculates new salt and adds it
      if (entry.index !== 'single' && !entry.deviation && this.saltValue > 0) {
        if (
          ((this.randomizeValueType === 'All' || this.randomizeValueType === 'Measurements') &&
            entry.messageId == MessageIds.Measurement) ||
          ((this.randomizeValueType === 'All' || this.randomizeValueType === 'SmartRest') && entry.templateId)
        ) {
          entry = this.calculateTheDeviation(entry);
        }
      }
    }

    this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);

    this.updateService.mo.c8y_Series = this.simSettings.allInstructionsArray;
    this.updateService.mo.c8y_saltValue = this.saltValue;
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {});
  }

  calculateTheDeviation(entry: IndexedCommandQueueEntry) {
    for (let i = 0; i < entry.values.length; i++) {
      let number = entry.values[i];
      if (number && !Number.isNaN(+number)) {
        let percentValue = Math.abs(+number * (this.saltValue / 100));
        let deviation = this.randomInterval(-percentValue, percentValue, 2);
        if (!entry.deviation) {
          entry.deviation = [deviation];
        } else {
          entry.deviation.push(deviation);
        }
        entry.values[i] = String(+number + deviation);
      }
    }
    return entry;
  }

  deepCopy(obj) {
    return _.cloneDeep(obj);
  }

  randomInterval(min: number, max: number, maxDigits: number): number {
    let random = (Math.random() * (max * 100 - min * 100 + 1) + min * 100) / 100;
    return this.numberOfDigitsAfterComma(random, maxDigits);
  }

  numberOfDigitsAfterComma(input: number, maxDigits: number): number {
    const powerOfDigits = Math.pow(10, maxDigits);
    return Math.round(input * powerOfDigits) / powerOfDigits;
  }
}
