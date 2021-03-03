import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { Chart, ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

export interface VerticalChartLine {
  type: string,
  label: string,
  value: number,
  color: string
}
export interface SleepChartBox { 
  valueStart: number, 
  valueEnd: number 
}
@Component({
  selector: 'app-simulator-chart',
  templateUrl: './simulator-chart.component.html',
  styleUrls: ['./simulator-chart.component.less']
})
export class SimulatorChartComponent implements OnInit, OnDestroy {
  public lineChartData: ChartDataSets[] = [];
  public commandQueue: CommandQueueEntry[] = [];
  private commandQueueSubscription: Subscription;
  public lineChartType: ChartType = 'line';

  verticalLines: VerticalChartLine[] = [];

  sleepDataSet: SleepChartBox[] = [];
  showAlarms = false;
  showSleeps = false;
  showEvents = false;
  eventLines = [];
  sleepLines = [];
  alarmLines = [];

  @Input() public numberOfRuns: number = 1;
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
  
  constructor(private simSettings: SimulatorSettingsService) { }

  ngOnDestroy(): void {
    if (this.commandQueueSubscription){
      this.commandQueueSubscription.unsubscribe( );
    }
  }



  public lineChartOptions: ChartOptions = {
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        ticks: {
          beginAtZero: true,
          callback: (value: number) => {
            if (Math.floor(value) === value) {
              return value;
            }
          }
        }
      }]
    },
    annotation: {
      drawTime: 'afterDatasetsDraw',
      annotations: []
    }
  } as ChartOptions;


  toggleAnnotations() {
    let chartAnnotations = this.chart.chart.options['annotation']['annotations'];
    chartAnnotations = [];
    if (this.showAlarms) { 
      chartAnnotations = [ ...chartAnnotations, ...this.alarmLines ];
    } 
    if (this.showSleeps) { 
      chartAnnotations = [...chartAnnotations, ...this.sleepLines];
    } 
    if (this.showEvents) { 
      chartAnnotations = [...chartAnnotations, ...this.eventLines];
    } 
    this.chart.chart.options['annotation']['annotations'] = chartAnnotations;
    console.info(this.showEvents, chartAnnotations, this.eventLines);
    this.chart.update();
  }


  toggleEvents() {
    this.showEvents = !this.showEvents;
    this.toggleAnnotations();
  }
  
  toggleSleeps() {
    this.showSleeps = !this.showSleeps;
    this.toggleAnnotations();
    
  }

  toggleAlarms(){
    this.showAlarms = !this.showAlarms;
    this.toggleAnnotations();
  }

  

  
  ngOnInit() {
    this.commandQueueSubscription = this.simSettings.commandQueueUpdate$.subscribe((commandQueue: CommandQueueEntry[]) => {
      this.commandQueue = commandQueue;
      this.createDataSetFromCommandQueue();
    });
    this.chart.plugins = [ChartAnnotation];
  }

  createDataSetFromCommandQueue(){
    const dataSet = [];
    this.sleepDataSet = [];
    this.verticalLines = [];
    console.error(this.commandQueue);
    let lastDataSet, lastFound, lastXValue = 0;
    for (let i = 0; i < this.numberOfRuns; i++) {
      for (const entry of this.commandQueue) {
        if(this.numberOfRuns === 1)
          console.log(dataSet);

        if (dataSet.length > 0) {
          if (entry.type === 'sleep'){

            for (let oldDataSets of dataSet) {
              for (let i = 0; i < entry.seconds; i++) {
                oldDataSets.data.push({ 
                  x: oldDataSets.data.length - 1, 
                  y: oldDataSets.data[oldDataSets.data.length-1].y 
                });
              }
              lastXValue+= +entry.seconds;
            }

            
            continue;
          }
       /*   if (entry.type === 'sleep') {
            this.sleepDataSet.push({
              valueStart: lastDataSet.x,
              valueEnd: +lastDataSet.x + +entry.seconds-1
            });
            for (let i = 0; i < entry.seconds; i++) {
              lastFound.push({ x: lastFound.length, y: lastDataSet.y });
            }
            lastXValue += +lastDataSet.x + +entry.seconds - 1;
            continue;
          }*/
          if (entry.messageId.startsWith('30')) {
            this.verticalLines.push({
              type: 'alarm',
              label: entry.values[0],
              value: dataSet.length-1,
              color: 'Red'
            });
            continue;
          }
          if (entry.messageId.startsWith('40')) {
            this.verticalLines.push({
              type: 'event',
              label: entry.values[0],
              value: dataSet.length - 1,
              color: 'Orange'
            });
            continue;
          }
        }
        

        const found = dataSet.find((a) => {
          if (a.label === entry.values[1]) {
            return a;
          }
        });

        if (found) {
          found.lastXValue++;
          found.data.push({ x: found.lastXValue, y: +entry.values[3] });
         /* lastDataSet = { x: lastXValue, y: +entry.values[3] };
          lastFound = found.data;
          found.lastXValue++;*/
        } else {
          dataSet.push({
            data: [{ x: lastXValue, y: +entry.values[3] }],
            label: entry.values[1],
            lineTension: 0,
            lastXValue: lastXValue
          });
        }
      }
    }
    console.error('sleeps', this.sleepDataSet);
    console.error('Alarms', this.verticalLines);
    this.createEventDataSet();
    this.createSleepSet();
    this.lineChartData = dataSet;
  }


  createEventDataSet(){
    let allLines = [
      ...this.verticalLines.map((verticalLine: VerticalChartLine, index) => {
        return {
          type: 'line',
          id: 'vline' + index,
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: verticalLine.value,
          lineType: verticalLine.type,
          borderColor: verticalLine.color,
          borderWidth: 2,
          label: {
            enabled: true,
            position: "top",
            content: verticalLine.type + ' ' + verticalLine.label
          }
        }
      })
    ];
    this.eventLines = allLines.filter(a => a.lineType === 'event' );
    this.alarmLines = allLines.filter(a => a.lineType === 'alarm' );
  }

  createSleepSet(){
    this.sleepLines = [
      ...this.sleepDataSet.map((sleepBox: SleepChartBox, index) => {
        return {
          id: 'low-box' + index,
          type: 'box',
          xScaleID: 'x-axis-0',
          yScaleID: 'y-axis-0',
          xMin: sleepBox.valueStart,
          xMax: sleepBox.valueEnd,
          backgroundColor: 'rgba(0, 0, 120, 0.3)',
          label: {
            enabled: true,
            position: "center",
            content: 'Sleep'
          }
        }
      })
    ];
  }


  



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
