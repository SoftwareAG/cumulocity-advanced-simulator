import { Component, OnInit } from '@angular/core';
import { SimulatorSettingsService } from 'src/services/simulatorSettings.service';

@Component({
  selector: 'app-sim-sleep',
  templateUrl: './sim-sleep.component.html',
  styleUrls: ['./sim-sleep.component.scss']
})
export class SimSleepComponent implements OnInit {

  constructor(private service: SimulatorSettingsService) { }

  ngOnInit() {
  }

}
