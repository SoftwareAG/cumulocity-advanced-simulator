import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

constructor() { }

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
