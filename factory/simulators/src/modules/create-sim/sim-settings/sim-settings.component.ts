import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sim-settings',
  templateUrl: './sim-settings.component.html',
  styleUrls: ['./sim-settings.component.scss']
})
export class SimSettingsComponent implements OnInit {

  constructor() { }

  
  defaultConfig: string[] = ['Measurements', 'Alarms', 'Events', 'Sleep'];
  selectedConfig: string = this.defaultConfig[0];
  ngOnInit() {
  }

  onChangeConfig(val) {
    this.selectedConfig = val;
  }

}
