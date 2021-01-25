import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-simulator-details',
  templateUrl: './simulator-details.component.html',
  styleUrls: ['./simulator-details.component.scss']
})
export class SimulatorDetailsComponent implements OnInit {

  @Input() commandQueue;
  constructor() { }

  ngOnInit() {
  }

}
