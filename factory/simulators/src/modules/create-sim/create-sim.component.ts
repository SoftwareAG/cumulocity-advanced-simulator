import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlarmService } from "@c8y/ngx-components/api";
import { CommandQueueEntry } from "@models/commandQueue.model";
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
  allInstructionsSeries = [];
  alarmSeries = [];
  smartRestConfig = [];
  commandQueue: CommandQueueEntry[] = [];
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
  simulatorTitle: string;

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
    this.simulatorTitle = this.mo.c8y_DeviceSimulator.name;
    this.commandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    this.simSettings.setCommandQueue(this.commandQueue);

    this.instructionsService.catDeleteMeasurement.subscribe((data) => {
      this.deletedMeasurement = data;
      this.deleteSeries(data);
    });

    this.simSettings.fetchAllSeries(this.mo).then(
      (res) =>
        (this.allInstructionsSeries = res.map((entry) => ({
          ...entry,
          active: false,
        })))
    );

    const filter = {
      withTotalPages: true,
      type: "c8y_SmartRest2Template",
      pageSize: 1000,
    };
    this.simService.getFilteredManagedObjects(filter).then((result) => {
      const temp = [];
      result.map((value) => {
        temp.push({
          values:
            value.com_cumulocity_model_smartrest_csv_CsvSmartRestTemplate
              .requestTemplates,
          templateId: value.name,
        });
      });

      temp.forEach((entry) => {
        const template = entry.templateId;
        const smartRestValuesArray = entry.values;
        smartRestValuesArray.forEach((smartRestEntry) =>
          this.smartRestConfig.push({
            smartRestFields: smartRestEntry,
            templateId: template,
          })
        );
      });
    });
  }

  updateViewState(val) {
    this.displayInstructionsView = val.instructionsView;
    this.editedVal = val.editedValue;
  }

  createSinusWave() {
    console.log('create sinuswave');
    for (let i = this.commandQueue.length - 1; i >= 0; i--) {
      this.commandQueue.push(this.commandQueue[i]);
    }
    this.simSettings.setCommandQueue(this.commandQueue);
  }

  deleteSeries(val) {
    if (val) {
      const minimumOfSeries = this.measurementsService.toMeasurementTemplate(
        val,
        val.minValue
      );
      const maximumOfSeries = this.measurementsService.toMeasurementTemplate(
        val,
        val.maxValue
      );
      const positionOfMinimum = this.commandQueue.findIndex((value) =>
        isEqual(value, minimumOfSeries)
      );
      const positionOfMaximum = this.commandQueue.findIndex((value) =>
        isEqual(value, maximumOfSeries)
      );
      this.commandQueue.splice(
        positionOfMinimum,
        positionOfMaximum - positionOfMinimum + 1
      );

      // TODO: add call to save to backend
    }
  }

  updateAllSeries(updatedAllInstructionsSeries) {
    this.allInstructionsSeries = updatedAllInstructionsSeries;
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
