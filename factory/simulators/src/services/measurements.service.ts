import { Injectable } from "@angular/core";
import { HelperService } from "./helper.service";

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

  public fetchMeasurements(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      resolve([
        {
          fragment: "dlval",
          series: "en",
          unit: "km",
          minValue: "0",
          maxValue: "10",
          steps: "3",
          sleep: "1",
        },
        {
          fragment: "ppval",
          series: "gg",
          unit: "l",
          minValue: "0",
          maxValue: "15",
          steps: "5",
          sleep: "1",
        },
      ]);
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
    return toBePushed;
  }
}
