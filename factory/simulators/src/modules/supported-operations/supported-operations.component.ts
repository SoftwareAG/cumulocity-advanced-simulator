import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-supported-operations",
  templateUrl: "./supported-operations.component.html",
  styleUrls: ["./supported-operations.component.less"],
})
export class SupportedOperationsComponent implements OnInit {
  constructor() {}

  defaultSupportedOperations = [
    { name: "Configuration", fragment: "c8y_Configuration", isActive: false },
    { name: "Device restart", fragment: "c8y_Restart", isActive: false },
    { name: "Firmware update", fragment: "c8y_Firmware", isActive: false },
    {name: 'Software update', fragment: 'c8y_Software', isActive: false}, 
  ];
  ngOnInit() {}
}
