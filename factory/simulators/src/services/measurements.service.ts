import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class MeasurementsService {

constructor(private helperService: HelperService) { }
measurements = [];
uniqueMeasurementsArray = [];
scaledArray = [];
randomSelected = false;

setMeasurements(measurements) {
  this.measurements = measurements;
}

public fetchMeasurements(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      resolve([{fragment: 'dlvalue', series: 'test', unit: 'km'}]);
    });
}

createUniqueMeasurementsArray() {
  for (let value of this.measurements.filter((a) => a.fragment)) {
    value.steps = +value.steps;
    value.minValue = +value.minValue;
    value.maxValue = +value.maxValue;

    if (this.uniqueMeasurementsArray.find((x) => x.fragment === value.fragment)) {
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
  return toBePushed;
}

}
