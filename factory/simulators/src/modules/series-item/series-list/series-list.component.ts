import { Component, Input, OnInit } from '@angular/core';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-series-list',
  templateUrl: './series-list.component.html',
  styleUrls: ['./series-list.component.less']
})
export class SeriesListComponent implements OnInit {

  @Input() commandQueue;
  @Input() instructionsSeries;
  private instructionsSeriesSubscription: Subscription;
  constructor(
    private simSettingsService: SimulatorSettingsService
  ) { }

  ngOnInit() {
     }

  ngOnDestroy() {
    if (this.instructionsSeriesSubscription) {
      this.instructionsSeriesSubscription.unsubscribe();
    }
  }

}
