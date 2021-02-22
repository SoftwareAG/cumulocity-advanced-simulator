import { Component, OnInit } from '@angular/core';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { Instruction } from '@models/instruction.model';
import { InstructionService } from '@services/Instruction.service';
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
  
  runthroughsPerMinute: number = 0;
  runthroughsPerHour: number = 0;
  runthroughsPerDay: number = 0;
  timeForOneLoop: number = 0;
  

  
  private commandQueueSubscription: Subscription;

  constructor(
    private simSettings: SimulatorSettingsService,
    private instructionService: InstructionService) { }

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

  //measurementCategory: { [key: string]: number } = {};
  measurementCategory = [];
  calculateInformationFromCommandQueue( ) {
    for(let i = 0; i < this.commandQueue.length; i++) {
      let entry = this.commandQueue[i];
      if (entry.type === 'sleep') {
        this.timeForOneLoop += +entry.seconds;
        if(this.measurementCategory.length > 0){
          this.measurementCategory[this.measurementCategory.length - 1].avg += +this.commandQueue[i-1].values[3] * +entry.seconds;
        }
      }

      if(entry.messageId === '200'){
        const identifier = entry.values[0] + ' ' + entry.values[1];
        let find = this.measurementCategory.find(a => a.identifier === identifier );
        if(find){
          find.value += +entry.values[3];
          find.avg += +entry.values[3];
          if(+entry.values[3] > find.highest){
            find.highest = +entry.values[3];
          }
          if(+entry.values[3] < find.lowest){
            find.highest = +entry.values[3];
          }
        } else {
          this.measurementCategory.push({ highest: 0, lowest: 0, identifier: identifier, value: +entry.values[3], unit: entry.values[2], avg: +entry.values[3]})
        }
      }

    }
    console.error(this.measurementCategory);

      this.runthroughsPerMinute = this.time.minute / this.timeForOneLoop;
      this.runthroughsPerHour = this.time.hour / this.timeForOneLoop;
      this.runthroughsPerDay = this.time.day / this.timeForOneLoop;
  }




}
