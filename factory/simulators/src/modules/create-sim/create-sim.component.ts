import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
@Component({
  selector: "app-create-sim",
  templateUrl: "./create-sim.component.html",
  styleUrls: ["./create-sim.component.less"],
})

export class CreateSimComponent implements OnInit {
  measurementSeries = [{}];
  commandQueue = [];
  data;
  mo;
  isExpanded = false;

  displayEditView = false;
  displayInstructionsView = false;
  editedVal;
  
  constructor(
    private route: ActivatedRoute,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private simService: SimulatorsServiceService
  ) {}
    
  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.measurementsService.fetchMeasurements().then((result)=>{
      this.measurementSeries = result;
      // this.measurementSeries.push({});
    });
    // this.mo.c8y_DeviceSimulator.id = this.mo.id;
  }

  updateViewState(val) {
    this.displayEditView = val.editView;
    this.displayInstructionsView = val.instructionsView;
    this.editedVal = val.editedValue;
    console.log(val.editedValue);
  }


  generateRequest() {
    const template = this.simSettings.generateRequest();
    this.commandQueue.push(...template);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      console.log(res);
    });
  }




}