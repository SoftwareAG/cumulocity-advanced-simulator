import { Component, OnInit } from '@angular/core';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-command-queue-statistics',
  templateUrl: './command-queue-statistics.component.html',
  styleUrls: ['./command-queue-statistics.component.scss']
})
export class CommandQueueStatisticsComponent implements OnInit {
  time = {day: 24*60*60, hour: 60 * 60, minute: 60};
  commandQueue: CommandQueueEntry[];
  
  runThrougsPerMinute: number = 0;
  runThrougsPerHour: number = 0;
  runThrougsPerDay: number = 0;
  timeForOneLoop: number = 0;
  
  measurementCategory: { [key:string]: number } = {};

  
  private commandQueueSubscription: Subscription;

  constructor(private simSettings: SimulatorSettingsService) { }

  ngOnDestroy(): void {
    if (this.commandQueueSubscription) {
      this.commandQueueSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.commandQueueSubscription = this.simSettings.commandQueueUpdate$.subscribe((commandQueue: CommandQueueEntry[]) => {
      this.commandQueue = commandQueue;
      console.error(commandQueue);
      this.calculateInformationFromCommandQueue();
    });
  }

  calculateInformationFromCommandQueue( ) {
    for(let entry of this.commandQueue) {
      if (entry.type === 'sleep') {
        this.timeForOneLoop += +entry.seconds;
      }

      if(entry.messageId === '200'){
        const identifier = entry.values[0] + ' ' + entry.values[1];
        if(this.measurementCategory[identifier]){
          this.measurementCategory[identifier] += +entry.values[2];
        } else {
          this.measurementCategory[identifier] = 0;
        }
      }
    }
    console.error(this.measurementCategory);

      this.runThrougsPerMinute = this.time.minute / this.timeForOneLoop;
      this.runThrougsPerHour = this.time.hour / this.timeForOneLoop;
      this.runThrougsPerDay = this.time.day / this.timeForOneLoop;
  }


}
