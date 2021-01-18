import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-simulator-chart',
  templateUrl: './simulator-chart.component.html',
  styleUrls: ['./simulator-chart.component.less']
})
export class SimulatorChartComponent implements OnInit {

  constructor() { }
  @Input() public lineChartData;
  @Input() public lineChartLabels;
  @Input() public lineChartColors;
  @Input() public lineChartLegend;
  @Input() public lineChartType;
  @Input() public lineChartPlugins;

  ngOnInit() {
  }

}
