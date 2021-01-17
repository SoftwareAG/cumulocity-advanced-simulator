let colors = ["#F5AD67", "#FF6ED6", "#6F83E8", "#6EFFB9", "#F5F369", "#F6F251", "#D47F42", "#E65CEB", "#487DD4", "#54F67C"];
colors = colors.concat(colors.map(a => a += "aa"));
colors = colors.concat(colors.map(a => a += "55"));

function createChart() {
    let convertedDataset = [];
    for (let entry of datasets) {
        if (!entry.values) continue;
        let currentDataset = convertedDataset[convertedDataset.length - 1];
        if (convertedDataset.length > 0 && currentDataset.label == entry.values[1]) {
            currentDataset.data.push(+entry.values[2]);
            if (biggestMaxStep < currentDataset.data.length) biggestMaxStep = currentDataset.data.length;
        } else {
            convertedDataset.push({
                label: entry.values[1],
                backgroundColor: colors[convertedDataset.length - 1],
                borderColor: colors[convertedDataset.length - 1],
                hidden: true,
                data: [+entry.values[2]]
            });
        }

    }


    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: scale(0, biggestMaxStep - 1, biggestMaxStep - 1),
            datasets: convertedDataset
        },
        options: {
        }
    });
     createBarCharts();

}




function createBarCharts() {
    // calculations based on input

    let oneCycleAvg = [];
    for (let entry of measurements.filter((a) => a.fragment)) {
        oneCycleAvg.push({ series: entry.series, avg: entry.maxValue / 2 });
    }
    var canvasCycle = document.getElementById('projections-input-based');
    var ctx = canvasCycle.getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: oneCycleAvg.map((a) => { return 'AVG calculated'; }),
            datasets: oneCycleAvg.map((a, b) => {
                return {
                    backgroundColor: colors[b],
                    borderColor: colors[b],
                    data: [a.avg],
                    label: a.series
                };
            })
        },
        options: {
            tooltips: { enabled: false },
            hover: { mode: null },
        }
    });

//      calculations based on the output
  
    let sumOfFragment = [];
    let numberOfMeasurements = 0;
    let sleeps = 0;
    for(let entry of datasets){
      if(entry.seconds){
        sleeps += entry.seconds;
      } else {
        numberOfMeasurements++;
        let fragment = sumOfFragment.find(a => a.x === entry.values[0]);
        if(fragment){
          fragment.y += +entry.values[2];
        }else{
          sumOfFragment.push({x: entry.values[0], y: +entry.values[2], interval: 'SumOfDataPoints'});
        }
      }
    }
    console.log(sumOfFragment, sleeps);
  
    let minute = 60 / sleeps;
    let hour = (60*60) / sleeps;
    let day = (60*60*24) / sleeps;
    let avgs = [ ];
    for(let timeframe of [{factor: minute, name: 'minute'}, {factor: hour, name: 'hour'}, {factor: day, name: 'day'}]){
      let avg = 0, x = '';
      var canvasCycle = document.getElementById('projections-'+timeframe.name);
      var ctx = canvasCycle.getContext('2d');
      var chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sumOfFragment.map((a) => { return  a.x+'|'+a.interval; }),
          datasets: sumOfFragment.map((a,b) => {
            avg = (a.y*timeframe.factor) / (timeframe.factor*numberOfMeasurements);
            x = a.x;
            return  {
              backgroundColor: colors[b],
              borderColor: colors[b],
              data: [a.y*timeframe.factor], label: timeframe.name
            };
          })
        },
        options: {
        }
      });
        avgs.push({ 'x': x, 'name': timeframe.name, 'avg':  avg});
    }
    console.error(avgs);
    console.error(avgs.map((a,b) => {
      return  {
        backgroundColor: colors[b],
        borderColor: colors[b],
        data: [a.avg], label: a.name
      };
    }), avgs.map((a) => { return  a.x + '|'+a.name; }));
    var canvasCycle = document.getElementById('projections-avg');
    var ctx = canvasCycle.getContext('2d');
    var chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: avgs.map((a) => { return  a.x + '|'+a.name; }),
        datasets: avgs.map((a,b) => {
          return  {
            backgroundColor: colors[b],
            borderColor: colors[b],
            data: [a.avg], label: a.name
          };
        })
      },
      options: {
      }
    });
    
}