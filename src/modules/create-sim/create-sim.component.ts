import { Component, HostListener, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alert, AlertService } from '@c8y/ngx-components';
import { IResult, ICurrentTenant } from '@c8y/client';
import { TenantService } from '@c8y/ngx-components/api';
import { Subscription } from 'rxjs';
import { AdditionalParameter, CommandQueueEntry, IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { AlarmsService } from '@services/alarms.service';
import { MeasurementsService } from '@services/measurements.service';
import { Modal } from '@models/modal.model';
import { InstructionService } from '@services/Instruction.service';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { SimulatorsBackendService } from '@services/simulatorsBackend.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { SmartRESTService } from '@services/smartREST.service';
import { UpdateInstructionsService } from '@services/updateInstructions.service';
import { HelperService } from '@services/helper.service';
import * as _ from 'lodash';
import { SeriesInstruction } from '@models/instruction.model';

@Component({
  selector: 'app-create-sim',
  templateUrl: './create-sim.component.html',
  styleUrls: ['./create-sim.component.scss']
})
export class CreateSimComponent implements OnInit {
  warningModal: Modal;
  readyToStartSimulator = false;
  allInstructionsSeries: SeriesInstruction[] = [];
  filteredInstructionsSeries = [];
  alarmSeries = [];
  smartRestConfig = [];
  commandQueue: CommandQueueEntry[] = [];
  data;
  mo;
  isExpanded = false;
  viewNewSeries = false;
  viewHistoricalSeries = false;
  actionButtons = ['New Series', 'Existing series'];
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
  indexedCommandQueue: IndexedCommandQueueEntry[] = [];
  instructionsSubscription: Subscription;
  indexedCommandQueueSubscription: Subscription;
  simulatorDuration: string;
  @ViewChild('title', { static: true }) el: ElementRef;

  instructionSeriesTypes = [
    { category: { icon: 'sliders', type: 'measurements', break: true } },
    { category: { icon: 'bell', type: 'alarms', break: false } },
    { category: { icon: 'tasks', type: 'events', break: true } },
    { category: { icon: 'clock-o', type: 'sleep', break: false } },
    { category: { icon: 'sitemap', type: 'smartRest', break: false } }
  ];
  listClass = 'interact-list';
  height = window.innerHeight * 0.7;
  y = 100;
  oldY = 0;
  grabber = false;
  wizardStep = 0;
  scrollTransitionInPercentage = 0.3;
  countdownInterval;
  savedInterval: string;
  currentTenantInfo: Promise<ICurrentTenant>;

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    var checkSimulator = document.getElementById('check-simulator');
    var bulkSimulator = document.getElementById('bulk-simulator');
    var maintainSimulator = document.getElementById('maintain-simulator');
    var scrollValue = window.scrollY + window.innerHeight * this.scrollTransitionInPercentage;

    if (scrollValue < checkSimulator.offsetTop) {
      this.wizardStep = 0;
    } else if (scrollValue > checkSimulator.offsetTop && scrollValue < bulkSimulator.offsetTop) {
      this.wizardStep = 1;
    } else if (scrollValue > bulkSimulator.offsetTop && scrollValue < maintainSimulator.offsetTop) {
      this.wizardStep = 2;
    } else if (scrollValue > maintainSimulator.offsetTop) {
      this.wizardStep = 3;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simSettings: SimulatorSettingsService,
    private backend: SimulatorsBackendService,
    private simService: SimulatorsServiceService,
    private instructionsService: InstructionService,
    private alertService: AlertService,
    private updateService: ManagedObjectUpdateService,
    private smartRestService: SmartRESTService,
    private tenantService: TenantService
  ) {}

  ngOnInit() {
    this.currentTenantInfo = this.getTenantInfo();

    // TODO move to separate functions
    this.instructionsSubscription = this.simSettings.instructionsSeriesUpdate$.subscribe((instructions) => {
      this.allInstructionsSeries = instructions;
      this.filteredInstructionsSeries = this.allInstructionsSeries;
    });

    this.indexedCommandQueueSubscription = this.simSettings.indexedCommandQueueUpdate$.subscribe(
      (indexedCommandQueue: IndexedCommandQueueEntry[]) => {
        this.indexedCommandQueue = indexedCommandQueue;
      }
    );

    this.data = this.route.snapshot.data;
    this.mo = this.data.simulator.data;
    const mo = _.cloneDeep(this.mo);
    this.updateService.setManagedObject(mo);
    this.simulatorTitle = this.mo.c8y_DeviceSimulator.name;
    const MOCommandQueue = this.mo.c8y_DeviceSimulator.commandQueue;
    this.commandQueue = MOCommandQueue;

    this.allInstructionsSeries = this.mo.c8y_Series;
    let additionals: AdditionalParameter[] = this.mo.c8y_additionals;
    this.indexedCommandQueue = this.simSettings.createIndexedCommandQueue(
      additionals,
      this.allInstructionsSeries,
      MOCommandQueue
    );
    this.simSettings.setCommandQueue(this.commandQueue);
    this.simSettings.setIndexedCommandQueue(this.indexedCommandQueue);
    this.filteredInstructionsSeries = this.allInstructionsSeries;
    this.simSettings.setAllInstructionsSeries(this.allInstructionsSeries);
    this.simulatorRunning = this.mo.c8y_DeviceSimulator.state === 'RUNNING';

    const filter = {
      withTotalPages: true,
      type: 'c8y_SmartRest2Template',
      pageSize: 1000
    };
    this.simService.getFilteredManagedObjects(filter).then((result) => {
      const temp = [];
      const ids = [];
      result.map((value) => {
        temp.push({
          values: value.com_cumulocity_model_smartrest_csv_CsvSmartRestTemplate.requestTemplates,
          templateId: value.id
        });
      });

      const arrayOfPromises = [];
      temp.forEach((entry) => {
        const externalId = entry.templateId;
        arrayOfPromises.push(this.simService.fetchExternalIds(externalId));
      });
      Promise.all(arrayOfPromises).then((result) => {
        temp.forEach((entry, index) => (entry.templateId = result[index].data[0].externalId));
        temp.forEach((entry) => {
          const template = entry.templateId;
          const smartRestValuesArray = entry.values;
          smartRestValuesArray.forEach((smartRestEntry) =>
            this.smartRestConfig.push({
              smartRestFields: smartRestEntry,
              templateId: template
            })
          );
        });
        this.instructionsService.SmartRestArray = this.smartRestConfig;
        this.smartRestService.setSmartRestUpdate(this.smartRestConfig);
      });
    });
  }

  ngOnDestroy() {
    if (this.instructionsSubscription) {
      this.instructionsSubscription.unsubscribe();
    }
    if (this.indexedCommandQueueSubscription) {
      this.indexedCommandQueueSubscription.unsubscribe();
    }
  }

  getCurrentSimulatorState(event: boolean) {
    this.invalidSimulator = event;
  }

  getCurrentValue(event) {
    this.editedValue = event;
  }

  changeRouteLastSite() {
    this.router.navigate(['/']);
  }

  filterAllInstructionsList() {
    this.filteredInstructionsSeries = this.allInstructionsSeries.filter((series) =>
      this.simSettings.objectContainsSearchString(series, this.searchString)
    );
  }

  updateViewState(val) {
    this.displayInstructionsView = val.instructionsView;
    this.editedVal = val.editedValue;
  }

  onClearAllInstructions() {} // FIXME unused / deprecaed?

  delete(value) {
    if (!this.warningModal) {
      this.warningModal = {
        title: 'Delete Series',
        type: 'warning',
        message: '',
        options: ['', '']
      };
      return;
    }
    var index = this.allInstructionsSeries.indexOf(value);
    if (index !== -1) {
      this.allInstructionsSeries.splice(index, 1);
    }
    this.updateService.mo.c8y_Series = this.allInstructionsSeries;
    this.updateService.updateSimulatorObject(this.updateService.mo).then(
      (res) => {
        const alert = {
          text: `Instruction Series deleted successfully.`,
          type: 'success'
        } as Alert;
        this.alertService.add(alert);
      },
      (err) => {
        const alert = {
          text: `Instruction Series could not be deleted`,
          type: 'danger'
        } as Alert;
        this.alertService.add(alert);
      }
    );
  }

  redirectToDeviceManagement() {
    const deviceIdOfSimulator = this.mo.id;
    this.currentTenantInfo.then((tenant: ICurrentTenant) => {
      window.location.href = `//${tenant.domainName}/apps/devicemanagement/index.html#/device/${deviceIdOfSimulator}/device-info`;
    });
  }

  editSimulatorTitle() {
    this.editMode = false;
    this.updateService.mo.c8y_DeviceSimulator.name = this.simulatorTitle;
    this.updateService.mo.name = this.simulatorTitle;
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {}); // FIXME proper handling
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
    this.currentSelection === this.actionButtons[0] ? (this.viewNewSeries = true) : (this.viewNewSeries = false);
  }

  autoScrollTo(newStep: number) {
    let element = '';
    switch (newStep) {
      case 0:
        element = 'create-simulator';
        break;
      case 1:
        element = 'check-simulator';
        break;
      case 2:
        element = 'bulk-simulator';
        break;
      case 3:
        element = 'maintain-simulator';
        break;
    }

    let y = document.getElementById(element).offsetTop;
    window.scrollTo({ top: y - 170, behavior: 'smooth' });
  }

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
    if (+this.simulatorDuration > 0) {
      this.savedInterval = this.simulatorDuration;
      this.countdownInterval = setInterval(() => {
        this.simulatorDuration = String(+this.simulatorDuration - 1);
        if (+this.simulatorDuration === 0) {
          this.toggleSimulatorState();
          this.simulatorDuration = this.savedInterval;
          clearInterval(this.countdownInterval);
        }
      }, 1000);
    }
    this.updateService.mo.c8y_DeviceSimulator.state =
      this.updateService.mo.c8y_DeviceSimulator.state === 'RUNNING' ? 'PAUSED' : 'RUNNING';

    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {
      const moId = res.id;
      this.backend.connectToSimulatorsBackend(this.updateService.mo.c8y_DeviceSimulator, moId);
      this.simulatorRunning = this.updateService.mo.c8y_DeviceSimulator.state === 'RUNNING';
    });
  }

  onFocusTitle() {
    this.editMode = true;
    setTimeout(() => {
      this.el.nativeElement.focus();
    });
  }

  openSimulatorInDevmanagement() {} // FIXME to be removed?

  private getTenantInfo(): Promise<ICurrentTenant> {
    return this.tenantService.current().then((res: IResult<ICurrentTenant>) => res.data);
  }
}
