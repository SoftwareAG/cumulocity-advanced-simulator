let sortBy = "groups";
let sleepSetting = "Sleep after measurement Group";
let defaultSleepSetting = "All same sleep";

function changeGrouping(obj) {
  if (obj.value === 'All Measurements than sleep') sortBy = "groups";
  if (obj.value === 'One Measurement Group than sleep') sortBy = "";
}

function changeSleep(obj) {
  sleepSetting = obj.value;
}

function changeDefaultSleep(obj) {
  defaultSleepSetting = obj.value;
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let biggestMaxStep = 0;