
import { Injectable } from "@angular/core";
import { CustomSimulator, DeviceSimulator } from "@models/simulator.model";
import { HelperService } from './helper.service';
import { AlarmInstruction, BasicEventInstruction, MeasurementInstruction, SleepInstruction, EventInstruction } from '@models/instruction.model';
import { keyframes } from '@angular/animations';


@Injectable({
  providedIn: "root",
})
export class MeasurementsService {
  constructor(private helperService: HelperService) {}
  measurements = [];
  measurementSeries = [];
  uniqueMeasurementsArray = [];
  scaledArray = [];
  randomSelected = false;

  setMeasurements(measurements) {
    this.measurements = measurements;
  }

pushToMeasurements(measurements) {
  this.measurements.push(measurements);
}

public fetchMeasurements(mo: CustomSimulator): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.measurementSeries = mo.c8y_MeasurementSeries;
      resolve(this.measurementSeries);
    });
  }

  createUniqueMeasurementsArray() {
    for (let value of this.measurements.filter((a) => a.fragment)) {
      value.steps = +value.steps;
      value.minValue = +value.minValue;
      value.maxValue = +value.maxValue;

      if (
        this.uniqueMeasurementsArray.find((x) => x.fragment === value.fragment)
      ) {
        const pos = this.uniqueMeasurementsArray.findIndex(
          (x) => x.fragment === value.fragment
        );

        const nowScaled = this.helperService.scale(
          value.minValue,
          value.maxValue,
          value.steps,
          this.randomSelected
        );
        this.scaledArray[pos].push(...nowScaled);
      } else {
        const nowScaled = this.helperService.scale(
          value.minValue,
          value.maxValue,
          value.steps,
          this.randomSelected
        );
        this.uniqueMeasurementsArray.push(value);
        this.scaledArray.push(nowScaled);
      }
    }
  }

  toMeasurementTemplate(measurement, value) {
    let toBePushed = `{
  "messageId": "200",
  "values": ["FRAGMENT", "SERIES", "VALUE", "UNIT"], "type": "builtin"
  }`;

  toBePushed = toBePushed.replace("FRAGMENT", measurement.fragment);
  toBePushed = toBePushed.replace("SERIES", measurement.series);
  toBePushed = toBePushed.replace("VALUE", value);
  toBePushed = toBePushed.replace("UNIT", measurement.unit);
  return JSON.parse(toBePushed);
}


}
