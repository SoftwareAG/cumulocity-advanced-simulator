import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  constructor() {}

  scale(min, max, steps, randomSelected) {
    let values = [min];
    if (!randomSelected) {
      let calcStep = (max - min) / steps;
      for (let i = 0; i < steps; i++) {
        values.push(+values[i] + calcStep);
      }
    } else {
      for (let i = 1; i < steps; i++) {
        values.push(Math.floor(Math.random() * (max - min)) + min);
      }
    }
    return values;
  }

  scaleTest(min, max, steps, randomSelected) {
    let values = [min];
    if (randomSelected === "linear") {
      let calcStep = (max - min) / steps;
      for (let i = 0; i < steps; i++) {
        values.push(+values[i] + calcStep);
      }
    } else if (randomSelected === "random") {
      for (let i = 1; i <= steps; i++) {
        values.push(Math.floor(Math.random() * (max - min)) + min);
      }
    } else if (randomSelected === "wave") {
      let temp = [min];
      // let values = [];
      let calcStep = (max - min) / steps;
      for (let i = 0; i < steps; i++) {
        temp.push(+temp[i] + calcStep);
      }
      let height = this.getAverage(temp[0], temp[1]);
      // temp.splice()
      temp.forEach((val, idx) => {
        if (idx % 2 == 0) {
          values.push(val + height);
        } else {
          values.push(val - height);
        }
        values.shift();
      });
    }
    return values;
  }

  getAverage(min, max) {
    return (max - min) / 2;
  }

  extractArrayValuesByColumn(arr, col) {
    let msmts = [];
    for (var i = 0; i < arr.length; i++) {
      msmts.push(arr[i][col]);
    }
    return msmts;
  }

  groupBy(array, prop) {
    var grouped = {};
    for (var i = 0; i < array.length; i++) {
      var p = array[i][prop];
      if (!grouped[p]) {
        grouped[p] = [];
      }
      grouped[p].push(array[i]);
    }
    return grouped;
  }
}
