import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';
import { SeriesMeasurementInstruction } from '@models/instruction.model';

@Injectable({
  providedIn: 'root'
})
export class MeasurementsService {
  uniqueMeasurementsArray: SeriesMeasurementInstruction[] = [];
  measurements: SeriesMeasurementInstruction[] = [];
  measurementSeries: SeriesMeasurementInstruction[] = [];
  scaledArray = [];
  randomSelected = false;

  constructor(private helperService: HelperService) {}

  pushToMeasurements(measurements: SeriesMeasurementInstruction) {
    this.measurements.push(measurements);
  }

  createUniqueMeasurementsArray() {
    for (let value of this.measurements.filter((a) => a.fragment)) {
      value.steps = +value.steps;
      value.minValue = +value.minValue;
      value.maxValue = +value.maxValue;

      if (this.uniqueMeasurementsArray.find((x) => x.fragment === value.fragment)) {
        const pos = this.uniqueMeasurementsArray.findIndex((x) => x.fragment === value.fragment);

        const nowScaled = this.helperService.scale(value.minValue, value.maxValue, value.steps, this.randomSelected);
        this.scaledArray[pos].push(...nowScaled);
      } else {
        const nowScaled = this.helperService.scale(value.minValue, value.maxValue, value.steps, this.randomSelected);
        this.uniqueMeasurementsArray.push(value);
        this.scaledArray.push(nowScaled);
      }
    }
  }
}
