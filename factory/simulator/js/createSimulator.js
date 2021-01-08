let resultTemplate =
{
    "instances": 1,
    "state": "PAUSED",
    "name": "Christians Postman simulator",
    "commandQueue": [],
    "supportedOperations": {}
};

function downloadTable() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(measurements));
    var dlAnchorElem = document.createElement('A');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "table.json");
    dlAnchorElem.click();
}

function scale(min, max, steps) {
    let values = [min];
    let calcStep = (max - min) / (steps);
    for (let i = 0; i < steps; i++) {
        values.push(+values[i] + calcStep);
    }
    return values;
}

let allTypes = [];
function generateResult() {
    resultTemplate.commandQueue = [];
    let allSteps = 0;

    for (value of measurements.filter((a) => a.fragment)) {
        allSteps += +value.steps;
        value.steps = +value.steps;
        value.minValue = +value.minValue;
        value.maxValue = +value.maxValue;
        let scaledArray = scale(value.minValue, value.maxValue, value.steps);

        for (let scaled of scaledArray) {

            let toBePushed = `{
                            "messageId": "200",
                            "values": ["FRAGMENT", "SERIES", "VALUE", "UNIT"], "type": "builtin"
                            }`;

            toBePushed = toBePushed.replace("FRAGMENT", value.fragment);
            toBePushed = toBePushed.replace("SERIES", value.series);
            toBePushed = toBePushed.replace("VALUE", scaled);
            toBePushed = toBePushed.replace("UNIT", value.unit);

            resultTemplate.commandQueue.push(JSON.parse(toBePushed));
            if (value.sleep || (defaultSleepValue && !Number.isNaN(defaultSleepValue))) {
                resultTemplate.commandQueue.push({
                    "type": "sleep",
                    "seconds": (value.sleep) ? value.sleep : defaultSleepValue
                });
            }
        }
        /*
            let startPoint = resultTemplate.commandQueue.length-4;
            for(let i = startPoint; i >= 0; i--){
              resultTemplate.commandQueue.push(deepCopy(resultTemplate.commandQueue[i]));
            }
        */
    }

    if (sortBy == "groups" && measurements.filter((a) => a.fragment).length > 1 && defaultSleepValue) {
        let cacheArr = [];
        let countSteps = 0;
        for (let i = 0; i < allSteps; i++) {
            for (let j = 0; j < measurements.length; j++) {
                let arrIndex = resultTemplate.commandQueue.findIndex((x) => { if (x && x.values && x.values[1] == measurements[j].series) { return true; } });
                if (resultTemplate.commandQueue[arrIndex]) {
                    cacheArr.push(resultTemplate.commandQueue[arrIndex]);
                    delete resultTemplate.commandQueue[arrIndex];
                }
                countSteps++;
            }

            if (countSteps < allSteps) {
                cacheArr.push({
                    "type": "sleep",
                    "seconds": defaultSleepValue
                });
            }
        }
        resultTemplate.commandQueue = cacheArr;
    }
    for (let alarm of alarms.filter((a) => a.alarmText)) {
        let typeToNumber = { 'Major': 302, 'Critical': 301, 'Minor': 303 };
        let toBePushed = `{
                        "messageId": "${typeToNumber[alarm.type]}",
                        "values": ["TYPE", "TEXT", ""], "type": "builtin"
                      }`;

        toBePushed = toBePushed.replace("TYPE", alarm.alarmType);
        toBePushed = toBePushed.replace("TEXT", alarm.alarmText);
        resultTemplate.commandQueue.push(JSON.parse(toBePushed));

        if (alarm.sleep || (defaultSleepValue && !Number.isNaN(defaultSleepValue))) {
            resultTemplate.commandQueue.push({
                "type": "sleep",
                "seconds": (alarm.sleep) ? alarm.sleep : defaultSleepValue
            });
        }
    }
    //datasets = deepCopy(resultTemplate.commandQueue);
    //createChart();
    document.getElementById("result").value = JSON.stringify(resultTemplate);
}