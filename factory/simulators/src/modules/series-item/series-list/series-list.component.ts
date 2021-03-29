import { Component, Input, OnInit } from '@angular/core';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-series-list',
  templateUrl: './series-list.component.html',
  styleUrls: ['./series-list.component.less']
})
export class SeriesListComponent implements OnInit {

  allInstructionsSeries;
  @Input() set instructionsSeries(instructionsArray) {
    this.allInstructionsSeries = instructionsArray;
  };

  get instructionsSeries() {
    return this.allInstructionsSeries;
  }
  @Input() indexedCommandQueue;
  private instructionsSeriesSubscription: Subscription;
  constructor(
    private simSettingsService: SimulatorSettingsService
  ) { }

  ngOnInit() {
    // this.instructionsSeries = this.simSettingsService.allInstructionsArray;
     }

  ngOnDestroy() {
    if (this.instructionsSeriesSubscription) {
      this.instructionsSeriesSubscription.unsubscribe();
    }
  }

}
