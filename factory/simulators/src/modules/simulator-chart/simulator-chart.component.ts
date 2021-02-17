import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

@Component({
  selector: 'app-simulator-chart',
  templateUrl: './simulator-chart.component.html',
  styleUrls: ['./simulator-chart.component.less']
})
export class SimulatorChartComponent implements OnInit {
  public lineChartData: ChartDataSets[];
  @Input() public commandQueue: CommandQueueEntry[];
  @Input() public numberOfRuns: number = 1;
  
  constructor() { }
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  ngOnInit() {
    const dataSet = [];
    console.error(this.commandQueue);
    for(let i = 0; i < this.numberOfRuns; i++){
      for(const entry of this.commandQueue){
        if(entry.type === 'sleep'){
          for (let i = 0; i < entry.seconds; i++){
            dataSet[dataSet.length - 1].data.push({ x: dataSet[dataSet.length - 1].data.length, y: 0 });
          }
          continue;
        }
        
        const found = dataSet.find((a) => {
          if (a.label === entry.values[1] ){
            return a;
          }
        });
        
        if(found){
          found.data.push({x: found.data.length, y: +entry.values[3]});
        }else{
          dataSet.push({
            data: [{x: 0, y: +entry.values[3]}],
            label: entry.values[1],
            lineTension: 0
          });
        }
      }
    }

    console.error(this.commandQueue, dataSet);
    this.lineChartData = dataSet;
  }



  public lineChartType: ChartType = 'line';
  public lineChartOptions: ChartOptions = {
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        ticks: {
          beginAtZero: true,
          callback: (value: string | number) => {
            if (Math.floor(+value) === value) {
              return value;
            }
          }
        }
      }]
    }
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
}
