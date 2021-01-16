import { Component, OnInit } from '@angular/core';
import { BsModalService } from "ngx-bootstrap";
import { Subscription } from 'rxjs';
import { SimulatorConfigComponent } from '../simulator-config/simulator-config.component';

@Component({
  selector: 'app-simulator-entry',
  templateUrl: './simulator-entry.component.html',
  styleUrls: ['./simulator-entry.component.scss']
})
export class SimulatorEntryComponent implements OnInit {

  subscriptions = new Subscription();
  constructor(private modalService: BsModalService) { }

  ngOnInit() {
  }

  openAddNewSimulatorDialog() {
    const modal = this.modalService.show(SimulatorConfigComponent);
    // modal.content.device = this.device;
    this.subscriptions.add(
        modal.content.closeSubject.subscribe((result) => {
            if (result) {
                console.log(result);
                // this.existing_trips.push(result);
            }
            this.modalUnsubscribe();
        }));
}

modalUnsubscribe() {
    this.subscriptions.unsubscribe();
}

}
