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
      const pos = this.commandQueue.findIndex((entry) => entry === val);
      this.currentValue.emit({value: val, index: pos});
      console.log('Ival '+ {value: val, index: pos});
    }
  }

}
