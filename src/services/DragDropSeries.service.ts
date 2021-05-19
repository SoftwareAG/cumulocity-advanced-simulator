import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DragDropSeriesService {

constructor(
  private helperService: HelperService
) { }


createUpdatedIndexedCommandQueue(indexedCommandQueue, filtered) {
  
  let rearranged = Object.values(this.helperService.groupBy(
    indexedCommandQueue,
    "index"
  ));
  console.log('rearranged: ', rearranged);
  const temp: {index: string, commands: any}[] = rearranged.map((val, idx) => ({index: val[0].index as string, commands: val as any}));
  console.log('temp: ', temp);
  const rearrIdxCmdQ = temp.map((entry, idx) => ({
    newIdx: filtered.find((val: any) => val.series.index === entry.index).newIdx,
    series: entry,
  }));
  console.log('rearrIdxCmdQ: ', rearrIdxCmdQ);
  let finalUpdatedIndexedCommandQueue = [];
  rearrIdxCmdQ.forEach((entry) => {entry.series.index = entry.newIdx;});
  console.log(rearrIdxCmdQ);
  rearrIdxCmdQ.forEach((entry) => {entry.series.commands.forEach((command) => command.index = entry.newIdx)});
  let rearrangedCmdQ = rearrIdxCmdQ.map((entry) => entry.series);
  rearrangedCmdQ.forEach((entry) => entry.commands.forEach((command) => finalUpdatedIndexedCommandQueue.push(command)));
  return finalUpdatedIndexedCommandQueue.sort((a, b) => Number(a.index) - Number(b.index));
}

createArrayOfSingleInstructions(indexedCommandQueue) {
  let arrayOfSingleInstructions = indexedCommandQueue.filter(
    (entry) => entry.index === "single"
  );
  let arrayOfSingleInstructionObjects = [];
  arrayOfSingleInstructions.forEach((singleInstruction) => {
    const pos = indexedCommandQueue.findIndex((entry) =>
      _.isEqual(entry, singleInstruction)
    );
    arrayOfSingleInstructionObjects.push({
      instruction: singleInstruction,
      indexOfPrevious: pos,
    });
  });
  return arrayOfSingleInstructionObjects;
}
}
