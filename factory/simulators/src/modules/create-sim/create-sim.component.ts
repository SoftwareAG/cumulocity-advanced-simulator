import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlarmService } from "@c8y/ngx-components/api";
import { AlarmsService } from "@services/alarms.service";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
@Component({
  selector: "app-create-sim",
  templateUrl: "./create-sim.component.html",
  styleUrls: ["./create-sim.component.less"],
})

export class CreateSimComponent implements OnInit {
  measurementSeries = [];
  alarmSeries = [];
  commandQueue = [];
  data;
  mo;
  isExpanded = false;

  viewNewSeries = true;
  actionButtons = ['New Series', 'Existing series'];
  displayEditView = false;
  currentSelection: string = this.actionButtons[0];
  displayInstructionsView = false;
  editedVal;
  
  constructor(
    private route: ActivatedRoute,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private alarmService: AlarmsService,
    private simService: SimulatorsServiceService
  ) {}
    
  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    const promiseOfMeasurements = this.measurementsService.fetchMeasurements(this.mo);
    const promiseOfAlarms = this.alarmService.fetchAlarms(this.mo);
    Promise.all([promiseOfMeasurements, promiseOfAlarms]).then(([resultMeasurements, resultAlarms]) =>{
      this.measurementSeries = resultMeasurements.map((measurement) => ({...measurement, active: false}));
      this.alarmSeries = resultAlarms.map((alarm) => ({...alarm, active: false}));
    });

    // this.measurementSeries = result.map((measurement) =>({...measurement, active: false}));
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
    this.mo.c8y_MeasurementSeries.push(...this.measurementsService.measurements);
    this.mo.c8y_AlarmSeries.push(...this.alarmService.alarms);
    console.log(this.mo.c8y_MeasurementSeries);
    console.log(this.mo.c8y_AlarmSeries);
    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      console.log(res);
      this.measurementSeries = res.c8y_MeasurementSeries;
      this.alarmSeries = res.c8y_AlarmSeries;
      this.simSettings.resetUsedArrays();
    });
    
  }

  selectButton(item: string) {
    this.currentSelection = item;
    const activeElement = document.activeElement;
    if (activeElement && activeElement instanceof HTMLButtonElement) {
      activeElement.blur();
    }
    this.currentSelection === this.actionButtons[0] ? this.viewNewSeries = true : this.viewNewSeries = false;
  }


}