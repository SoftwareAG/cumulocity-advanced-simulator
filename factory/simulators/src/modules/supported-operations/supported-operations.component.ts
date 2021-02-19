import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CustomSimulator } from "@models/simulator.model";
import { BsModalService } from "ngx-bootstrap";
import { Subscription } from "rxjs";
import { CustomOperationComponent } from "./custom-operation/custom-operation.component";

@Component({
  selector: "app-supported-operations",
  templateUrl: "./supported-operations.component.html",
  styleUrls: ["./supported-operations.component.less"],
})
export class SupportedOperationsComponent implements OnInit {
  data: any;
  mo: CustomSimulator;
  subscriptions = new Subscription();
  constructor(private route: ActivatedRoute, private modalService: BsModalService,) {}

  defaultSupportedOperations = [
    { name: "Configuration", fragment: "c8y_Configuration", isActive: false },
    { name: "Device restart", fragment: "c8y_Restart", isActive: false },
    { name: "Firmware update", fragment: "c8y_Firmware", isActive: false },
    {name: 'Software update', fragment: 'c8y_Software', isActive: false}, 
  ];
  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    const operations = (this.mo.c8y_DeviceSimulator.c8y_SupportedOperations);
    operations.map((entry) => this.defaultSupportedOperations.filter((item) => item.fragment === entry)[0].isActive = true);
  }

  addCustomOperationModal() {
    const modal = this.modalService.show(CustomOperationComponent);
    this.subscriptions.add(
      modal.content.closeSubject.subscribe((result) => {
        if (result) {
        }
        this.modalUnsubscribe();
      })
    );
  }

  modalUnsubscribe() {
    this.subscriptions.unsubscribe();
  }
}
