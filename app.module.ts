import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { RouterModule as ngRouterModule, Routes } from "@angular/router";
import { ChartsModule, ThemeService } from "ng2-charts";
import {
  CoreModule,
  BootstrapComponent,
  RouterModule,
  HOOK_NAVIGATOR_NODES,
} from "@c8y/ngx-components";
// import { SimulatorEntryComponent } from './src/modules/simulator-entry/simulator-entry.component';
// RECOMMENDED
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { SimulatorEntryComponent } from "./src/modules/simulator-entry/simulator-entry.component";
import { NavFactory } from "./src/modules/factories/Navigation";
import { CreateSimComponent } from "./src/modules/create-sim/create-sim.component";
import { SimulatorConfigComponent } from "./src/modules/simulator-config/simulator-config.component";
import { SimulatorResolverService } from "./src/services/simulatorResolver.service";
import { SimulatorChartComponent } from "./src/modules/simulator-chart/simulator-chart.component";
import { C8yFactoriesModule } from "./src/modules/factories/c8yfactories.module";
import { AlarmsComponent } from "./src/modules/alarms/alarms.component";
import { SimSettingsComponent } from "./src/modules/create-sim/sim-settings/sim-settings.component";
import { EditInstructionComponent } from "./src/modules/create-sim/edit-instruction/edit-instruction.component";
import { ShowInstructionComponent } from "./src/modules/create-sim/show-instruction/show-instruction.component";
import { SupportedOperationsComponent } from "@modules/supported-operations/supported-operations.component";
import { CommandQueueStatisticsComponent } from "@modules/command-queue-statistics/command-queue-statistics.component";
import { CustomOperationComponent } from "@modules/supported-operations/custom-operation/custom-operation.component";
import { IsValuePipe } from "./src/shared/isValue.pipe";
import { ToStringPipe } from "./src/shared/toString.pipe";
import { WarningModalComponent } from "@modules/shared/warning-modal/warning-modal.component";
import { SeriesItemComponent } from "@modules/series-item/series-item.component";
import { SeriesListComponent } from "@modules/series-item/series-list/series-list.component";
import { CountPipe } from "./src/shared/count.pipe";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { IsNumberPipe } from "./src/shared/isNumber.pipe";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {DragDropModule} from '@angular/cdk/drag-drop';
import { InstructionTypePipe } from "./src/shared/instructionType.pipe";
import { BulkUpdatesComponent } from "@modules/bulk-updates/bulk-updates.component";
import { SimulatorFileUploadDialog } from "@modules/create-sim/sim-settings/simulator-file-upload-dialog";
import { BulkSimulatorsComponent } from "@modules/bulk-simulators/bulk-simulators.component";

const appRoutes: Routes = [
  { path: "", component: SimulatorEntryComponent },
  { path: "bulk-simulators", component: BulkSimulatorsComponent },
  {
    path: "createSim/:id",
    
    children: [{
      path: "instructions",
      component: CreateSimComponent,
    }, {
      path: "alarms",
      component: AlarmsComponent
      
    }, {
      path: "operations",
      component: SupportedOperationsComponent
      
    }, {
      path: "",
      redirectTo: 'instructions',
      pathMatch: 'full'
      
    },],
    resolve: {
      simulator: SimulatorResolverService,
    },
  },
];

@NgModule({
  imports: [
    AccordionModule.forRoot(),
    CollapseModule.forRoot(),
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
    TooltipModule.forRoot(),
    ngRouterModule.forRoot(appRoutes, { enableTracing: false, useHash: true }),
    CoreModule.forRoot(),
    C8yFactoriesModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    DragDropModule
  ],
  declarations: [
    SimulatorEntryComponent,
    CreateSimComponent,
    SimulatorConfigComponent,
    SimulatorChartComponent,
    WarningModalComponent,
    AlarmsComponent,
    SimSettingsComponent,
    EditInstructionComponent,
    BulkUpdatesComponent,
    CommandQueueStatisticsComponent,
    ShowInstructionComponent,
    SupportedOperationsComponent,
    CustomOperationComponent,
    IsValuePipe,
    ToStringPipe,
    SeriesItemComponent,
    SeriesListComponent,
    CountPipe,
    IsNumberPipe,
    InstructionTypePipe,
    SimulatorFileUploadDialog, 
    BulkSimulatorsComponent
  ],
  entryComponents: [
    SimulatorEntryComponent,
    CreateSimComponent,
    SimulatorConfigComponent,
    SimulatorChartComponent,
    WarningModalComponent,
    AlarmsComponent,
    SimSettingsComponent,
    EditInstructionComponent,
    CommandQueueStatisticsComponent,
    ShowInstructionComponent,
    BulkUpdatesComponent,
    SupportedOperationsComponent, 
    CustomOperationComponent,
    SeriesItemComponent,
    SeriesListComponent,
    SimulatorFileUploadDialog,
    BulkSimulatorsComponent
  ],
  providers: [ThemeService],

  bootstrap: [BootstrapComponent],
})
export class AppModule {}
