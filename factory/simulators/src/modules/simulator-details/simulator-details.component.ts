import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-simulator-details',
  templateUrl: './simulator-details.component.html',
  styleUrls: ['./simulator-details.component.scss']
})
export class SimulatorDetailsComponent implements OnInit {

  @Input() commandQueue;
  @Output() currentValue = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  updateCurrentValue(val) {
    if (val.type === 'builtin') {
      this.currentValue.emit(val);
      console.log(val);
    }
  }

}
