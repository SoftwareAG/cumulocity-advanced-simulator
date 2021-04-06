import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Alert, AlertService } from "@c8y/ngx-components";
import { AlarmService, IdentityService } from "@c8y/ngx-components/api";
import { CommandQueueEntry } from "@models/commandQueue.model";
import { Modal } from "@modules/shared/models/modal.model";
import { AlarmsService } from "@services/alarms.service";
import { InstructionService } from "@services/Instruction.service";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
// import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { MeasurementsService } from "@services/measurements.service";
import { SimulatorsBackendService } from "@services/simulatorsBackend.service";
import { SimulatorSettingsService } from "@services/simulatorSettings.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { SmartRESTService } from "@services/smartREST.service";
import { UpdateInstructionsService } from "@services/updateInstructions.service";
import { isEqual } from "lodash";
import * as _ from 'lodash';
import { Subscription } from "rxjs";
import { HelperService } from "@services/helper.service";
@Component({
  selector: "app-create-sim",
  templateUrl: "./create-sim.component.html",
  styleUrls: ["./create-sim.component.less"],
})
export class CreateSimComponent implements OnInit {
  warningModal: Modal;
  readyToStartSimulator = false;
  allInstructionsSeries = [];
  filteredInstructionsSeries = [];
  alarmSeries = [];
  smartRestConfig = [];
  commandQueue: CommandQueueEntry[] = [];
  data;
  mo;
  isExpanded = false;
  bulkView = false;

  viewNewSeries = false;
  viewHistoricalSeries = false;
  actionButtons = ["New Series", "Existing series"];
  displayEditView = false;
  currentSelection: string = this.actionButtons[0];
  displayInstructionsView = false;
  editedVal;
  editedValue;
  deletedMeasurement;
  simulatorTitle: string;
  searchString: string;
  invalidSimulator = false;
  editMode = false;
  simulatorRunning = false;
  commandQueueIndices = [];
  indexedCommandQueue = [];
  instructionsSubscription: Subscription;
  mirroredYAxis: boolean = false;
  indexedCommandQueueSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simSettings: SimulatorSettingsService,
    private measurementsService: MeasurementsService,
    private alarmService: AlarmsService,
    private backend: SimulatorsBackendService,
    private simService: SimulatorsServiceService,
    private updateInstructionsService: UpdateInstructionsService,
    private instructionsService: InstructionService,
    private alertService: AlertService,
    private updateService: ManagedObjectUpdateService,
    private smartRestService: SmartRESTService,
    private helperService: HelperService
  ) {}

  getCurrentSimulatorState(event: boolean) {
    this.invalidSimulator = event;
  }
  getCurrentValue(event) {
    console.log(event)
    this.editedValue = event;
  }
  changeRouteLastSite() {
    this.router.navigate(["/"]);
  }

  filterAllInstructionsList() {
    this.filteredInstructionsSeries = this.allInstructionsSeries.filter((series) => this.objectContainsSearchString(series, this.searchString));
  }

  objectContainsSearchString(series, searchString) {
    const value = _.pickBy(series, (value, key) => {
      return (key.toLowerCase().replace('/ /g', '').includes(searchString.toLowerCase().replace('/ /g', '')) || value.toLowerCase().replace('/ /g', '').includes(searchString.toLowerCase().replace('/ /g', '')))
    });
    console.log(value);
    return _.isEmpty(value) ? false : true;
  }

  ngOnInit() {
    this.instructionsSubscription = this.simSettings.instructionsSeriesUpdate$.subscribe((instructions) => {
      this.allInstructionsSeries = instructions;
      this.filteredInstructionsSeries = this.allInstructionsSeries;
    });

    this.indexedCommandQueueSubscription = this.simSettings.indexedCommandQueueUpdate$.subscribe((indexed) => {
      this.indexedCommandQueue = indexed;
    });

    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    console.log(this.mo);
    const mo = JSON.parse(JSON.stringify(this.mo));
    this.updateService.setManagedObject(mo);
    this.simulatorTitle = this.mo.c8y_DeviceSimulator.name;
    const MOCommandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    const MOIndices = this.mo.c8y_Indices;
      this.commandQueue = MOCommandQueue;
      
      this.commandQueueIndices = MOIndices;
      this.simSettings.setCommandQueueIndices(this.commandQueueIndices);
      this.simSettings.setCommandQueue(this.commandQueue);
      this.allInstructionsSeries = this.mo.c8y_Series;
      this.filteredInstructionsSeries = this.allInstructionsSeries;
    console.log('All Instructions series: ', this.allInstructionsSeries);
    console.log('Filtered Series: ', this.filteredInstructionsSeries);
    this.indexedCommandQueue = this.simSettings.getIndexedCommandQueue();
    this.simSettings.setAllInstructionsSeries(this.allInstructionsSeries);
    this.simulatorRunning = this.mo.c8y_DeviceSimulator.state === "RUNNING"; 

    const filter = {
      withTotalPages: true,
      type: "c8y_SmartRest2Template",
      pageSize: 1000,
    };
    this.simService.getFilteredManagedObjects(filter).then((result) => {
      const temp = [];
      const ids = [];
      result.map((value) => {
        temp.push({
          values:
            value.com_cumulocity_model_smartrest_csv_CsvSmartRestTemplate
              .requestTemplates,
          templateId: value.id,
        });
      });

      const arrayOfPromises = [];
      temp.forEach((entry) => {
        const externalId = entry.templateId;
        arrayOfPromises.push(this.simService.fetchExternalIds(externalId));
      });
      Promise.all(arrayOfPromises).then((result) => {
        temp.forEach(
          (entry, index) =>
            (entry.templateId = result[index].data[0].externalId)
        );
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
        this.instructionsService.SmartRestArray = this.smartRestConfig;
        this.smartRestService.setSmartRestUpdate(this.smartRestConfig);
        console.log(this.smartRestConfig);
      });
    });
  }

  updateViewState(val) {
    this.displayInstructionsView = val.instructionsView;
    this.editedVal = val.editedValue;
  }

  onClearAllInstructions() {

  }

  createSinusWave() {
    console.log("create sinuswave");
    for (let i = this.commandQueue.length - 1; i >= 0; i--) {
      this.commandQueue.push(this.commandQueue[i]);
    }
    this.simSettings.setCommandQueue(this.commandQueue);
  }

  delete(value) {
    if(!this.warningModal){
      this.warningModal = { 
        title: 'Delete Series',
        type: 'warning',
        message: '',
        options: ['','']
     };
     return;
    }
    var index = this.allInstructionsSeries.indexOf(value);
    if (index !== -1) {
      this.allInstructionsSeries.splice(index, 1);
    }
    console.log(this.allInstructionsSeries);
    this.updateService.mo.c8y_Series = this.allInstructionsSeries;
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {
      const alert = {
        text: `Instruction Series deleted successfully.`,
        type: "success",
      } as Alert;
      this.alertService.add(alert);
    }, (err) => {
      const alert = {
        text: `Instruction Series could not be deleted`,
        type: "danger",
      } as Alert;
      this.alertService.add(alert);
      
    });
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

  editSimulatorTitle() {
    this.editMode = false;
    this.updateService.mo.c8y_DeviceSimulator.name = this.simulatorTitle;
    this.updateService.mo.name = this.simulatorTitle;
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => console.log(res));
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

  height = window.innerHeight*0.7;
  y = 100;
  oldY = 0;
  grabber = false;

  onMouseMove(event: MouseEvent) {
    if (!this.grabber) {
      return;
    }
    this.resizer(event.clientY - this.oldY);
    this.oldY = event.clientY;
  }

  onMouseUp(event: MouseEvent) {
    this.grabber = false;
  }

  resizer(offsetY: number) {
    this.height += offsetY;
  }

  onMouseDown(event: MouseEvent) {
    this.grabber = true;
    this.oldY = event.clientY;
  }

  toggleSimulatorState() {
    this.mo.c8y_DeviceSimulator.state = (this.mo.c8y_DeviceSimulator.state === "RUNNING") ? "PAUSED" : "RUNNING";

    this.simService.updateSimulatorManagedObject(this.mo).then((res) => {
      console.log("State changed");
      const moId = res.id;
      this.backend.connectToSimulatorsBackend(this.mo.c8y_DeviceSimulator, moId);
      this.simulatorRunning = this.mo.c8y_DeviceSimulator.state === "RUNNING"; 
    });
  }
  openSimulatorInDevmanagement(){
  }

  ngOnDestroy() {
    if (this.instructionsSubscription) {
      this.instructionsSubscription.unsubscribe();
    }
    if (this.indexedCommandQueueSubscription) {
      this.indexedCommandQueueSubscription.unsubscribe();
    }
  }

}
