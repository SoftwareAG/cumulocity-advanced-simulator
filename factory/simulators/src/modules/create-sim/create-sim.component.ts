import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlarmService } from "@c8y/ngx-components/api";
import { AlarmsService } from "@services/alarms.service";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { UpdateInstructionsService } from "@services/updateInstructions.service";
import { isEqual } from "lodash";
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
  actionButtons = ["New Series", "Existing series"];
  displayEditView = false;
  currentSelection: string = this.actionButtons[0];
  displayInstructionsView = false;
  editedVal;
  editedValue;
  deletedMeasurement;

  constructor(
    private route: ActivatedRoute,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private alarmService: AlarmsService,
    private simService: SimulatorsServiceService,
    private instructionsService: UpdateInstructionsService
  ) {}

  getCurrentValue(event) {
    this.editedValue = event;
  }

  ngOnInit() {
    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    this.instructionsService.catDeleteMeasurement.subscribe((data) => {
      this.deletedMeasurement = data;
      this.deleteSeries(data);
    });
    this.simSettings
      .fetchAllSeries(this.mo)
      .then(
        (res) =>
          (this.measurementSeries = res.map((entry) => ({
            ...entry,
            active: false,
          })))
      );
  }

  updateViewState(val) {
    this.displayInstructionsView = val.instructionsView;
    this.editedVal = val.editedValue;
  }

  deleteSeries(val) {

    if (val) {
      
      const minimumOfSeries = this.measurementsService.toMeasurementTemplate(val, val.minValue);
      const maximumOfSeries = this.measurementsService.toMeasurementTemplate(val, val.maxValue);
      const positionOfMinimum = this.commandQueue.findIndex((value) =>
        isEqual(value, minimumOfSeries)
      );
      const positionOfMaximum = this.commandQueue.findIndex((value) => isEqual(value, maximumOfSeries));
      this.commandQueue.splice(positionOfMinimum, positionOfMaximum-positionOfMinimum+1);

      // TODO: add call to save to backend
    }
  }

  generateRequest() {
    const template = this.simSettings.generateRequest();
    this.commandQueue.push(...template);
    this.mo.c8y_DeviceSimulator.commandQueue = this.commandQueue;
    this.mo.c8y_Series.push(...this.simSettings.allSeries);
    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      this.measurementSeries = res.c8y_Series;
      this.simSettings.resetUsedArrays();
    });
  }

  selectButton(item: string) {
    this.currentSelection = item;
    const activeElement = document.activeElement;
    if (activeElement && activeElement instanceof HTMLButtonElement) {
      activeElement.blur();
    }
    this.currentSelection === this.actionButtons[0]
      ? (this.viewNewSeries = true)
      : (this.viewNewSeries = false);
  }
}
