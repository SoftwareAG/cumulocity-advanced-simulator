let defaultMinValue = null;
let defaultMaxValue = null;
let defaultStepValue = null;
let defaultSleepValue = null;

let template = { "fragment": null, "series": null, "minValue": null, "maxValue": null, "steps": null, "unit": null, "tempType": "measurement" };
let alarmTemplate = { "type": 'Critical', "alarmType": null, "alarmText": null, "tempType": "alarm" };


let measurements = [deepCopy(template)];
let datasets = [], alarms = [deepCopy(alarmTemplate)];


function generateFields() {
  let html = "";
  for (let i = 0; i < measurements.length; i++) {
    let number = measurements[i];
    html += `<br>
              <input onkeyup="measurements[${i}].fragment = this.value" placeholder="fragment" value="${(number.fragment) ? number.fragment : ''}">
              <input onkeyup="measurements[${i}].series = this.value" placeholder="series" value="${(number.series) ? number.series : ''}">
              <input onkeyup="measurements[${i}].minValue = +this.value" placeholder="minValue" value="${(number.minValue !== null) ? number.minValue : ''}">
              <input onkeyup="measurements[${i}].maxValue = +this.value" placeholder="maxValue" value="${(number.maxValue !== null) ? number.maxValue : ''}">
              <input onkeyup="measurements[${i}].steps = +this.value" placeholder="steps" value="${(number.steps !== null) ? number.steps : ''}">
              <input onkeyup="measurements[${i}].unit = this.value" placeholder="Unit" value="${(number.unit) ? number.unit : ''}">`;
    if (defaultSleepSetting === 'Individual Sleep') {
      html += `<input onkeyup="measurements[${i}].sleep = +this.value" placeholder="Sleep" value="${(number.sleep) ? number.sleep : ''}">`;
    }
  }
  document.getElementById("datapoints").innerHTML = html +
    `<button style="margin-left:40px;" onclick="measurements.push(deepCopy(template));generateFields();">Add Value</button>
    <button style="margin-left:10px;" onclick="measurements.push(deepCopy(measurements[measurements.length-1]));generateFields();">Copy Value</button><br>`;

  let html2 = "";
  for (let i = 0; i < alarms.length; i++) {
    let alarm = alarms[i];
    html2 += `
        <br>
        <select onchange="alarms[${i}].type = this.value">
          <option>Critical</option>
          <option>Major</option>
          <option>Minor</option>
        </select>
        <input onkeyup="alarms[${i}].alarmType = this.value" placeholder="Alarm Type" value="">
        <input onkeyup="alarms[${i}].alarmText = this.value" placeholder="Alarm Text" value="">`;
    if (defaultSleepSetting === 'Individual Sleep') {
      html2 += `<input onkeyup="alarms[${i}].sleep = +this.value" placeholder="Sleep" value="${(alarm.sleep) ? alarm.sleep : ''}">`;
    }
  }

  document.getElementById("alarms").innerHTML = html2 +
    `<button style="margin-left:40px;" onclick="alarms.push(deepCopy(alarmTemplate));generateFields();">Add Alarm</button><br>
    <button onclick="generateResult()">Generate HTTP Request</button>`;
}


//converts postman GET measurements or once exported data to internal datastructure
//should be improved and with less redundancy
function refreshGlobalInputs(input) {
  if (!input) {
    input = document.getElementById("inserts").value;
    input = input || '';
  }
  try {
    values = JSON.parse(input.replace(/\s+/gi, ' '));

    measurements = [];
    if (values[0] && values[0].fragment) {
      measurements = values;
      overwriteMeasurementsWithDefaultValues();
      generateFields();
      return;
    }

    for (let key in values) {
      let template2 = deepCopy(template);
      for (let key2 in values[key]) {
        if (key2 == "unit" || key2 == "series" || key2 == "fragment")
          template2[key2] = values[key][key2];
        if (defaultMinValue !==  null && defaultMinValue.length !== 0) template2.minValue = +defaultMinValue;
        if (defaultMaxValue !== null && defaultMaxValue.length !== 0) template2.maxValue = +defaultMaxValue;
        if (defaultStepValue !== null && defaultStepValue.length !== 0) template2.steps = +defaultStepValue;
        if (defaultSleepValue !== null && defaultSleepValue.length !== 0 && defaultSleepSetting === 'Individual Sleep') {
          number.sleep = +defaultSleepValue;
        } else {
          delete number.sleep;
          defaultSleepValue = +defaultSleepValue;
        }
      }
      measurements.push(template2);
    }
  } catch (e) {
    console.info(e);
  }
  if(measurements){
    console.log(measurements);
    overwriteMeasurementsWithDefaultValues();
    console.log(measurements);
  }
  generateFields();
}


function overwriteMeasurementsWithDefaultValues(){
  for (let number of measurements) {
    if (defaultMinValue !== null && defaultMinValue.length !== 0) number.minValue = +defaultMinValue;
    if (defaultMaxValue !== null && defaultMaxValue.length !== 0) number.maxValue = +defaultMaxValue;
    if (defaultStepValue !== null && defaultStepValue.length !== 0) number.steps = +defaultStepValue;
    if (defaultSleepValue !== null && defaultSleepValue.length !== 0 && defaultSleepSetting === 'Individual Sleep') {
      number.sleep = +defaultSleepValue;
    } else {
      delete number.sleep;
      defaultSleepValue = +defaultSleepValue;
    }
  }
}