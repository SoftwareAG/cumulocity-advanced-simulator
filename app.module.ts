import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { RouterModule as ngRouterModule, Routes } from '@angular/router';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CoreModule, BootstrapComponent, RouterModule, HOOK_TABS } from '@c8y/ngx-components';
import { SimulatorResolverService } from '@services/simulatorResolver.service';
import { SimulatorEntryComponent } from '@modules/simulator-entry/simulator-entry.component';
import { CreateSimComponent } from '@modules/create-sim/create-sim.component';
import { SimulatorConfigComponent } from '@modules/simulator-config/simulator-config.component';
import { SimulatorChartComponent } from '@modules/simulator-chart/simulator-chart.component';
import { C8yFactoriesModule } from '@modules/factories/c8yfactories.module';
import { AlarmsComponent } from '@modules/alarms/alarms.component';
import { SimSettingsComponent } from '@modules/create-sim/sim-settings/sim-settings.component';
import { EditInstructionComponent } from '@modules/create-sim/edit-instruction/edit-instruction.component';
import { ShowInstructionComponent } from '@modules/create-sim/show-instruction/show-instruction.component';
import { CommandQueueStatisticsComponent } from '@modules/command-queue-statistics/command-queue-statistics.component';
import { SupportedOperationsComponent } from '@modules/supported-operations/supported-operations.component';
import { CustomOperationComponent } from '@modules/supported-operations/custom-operation/custom-operation.component';
import { SeriesItemComponent } from '@modules/series-item/series-item.component';
import { SeriesListComponent } from '@modules/series-item/series-list/series-list.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BulkUpdatesComponent } from '@modules/bulk-updates/bulk-updates.component';
import { SimulatorFileUploadDialog } from '@modules/create-sim/sim-settings/simulator-file-upload-dialog';
import { BulkSimulatorsComponent } from '@modules/bulk-simulators/bulk-simulators.component';
import { TemplateSelectionDialog } from '@modules/simulator-entry/template-selection-dialog';
import { SaveSimulatorTemplateDialog } from '@modules/create-sim/sim-settings/save-simulator-template-dialog';
import { TemplatesListComponent } from '@modules/templates-list/templates-list.component';
import { CustomTabFactory } from '@modules/factories/tab.factory';
import { TemplateOverviewComponent } from '@modules/template-overview/template-overview.component';
import { TemplateResolverService } from '@services/templateResolver.service';
import { CsvImportComponent } from '@modules/create-sim/csv-import/csv-import.component';
import { SharedComponentsModule } from '@shared/shared.module';

const appRoutes: Routes = [
  { path: '', redirectTo: 'simulators', pathMatch: 'full' },
  { path: 'simulators', component: SimulatorEntryComponent },
  { path: 'bulk-simulators', component: BulkSimulatorsComponent },
  {
    path: 'templates',
    component: TemplatesListComponent
  },
  {
    path: 'templates/:id',
    component: TemplateOverviewComponent,
    resolve: {
      template: TemplateResolverService
    }
  },
  {
    path: 'createSim/:id',

    children: [
      {
        path: 'instructions',
        component: CreateSimComponent
      },
      {
        path: 'alarms',
        component: AlarmsComponent
      },
      {
        path: 'operations',
        component: SupportedOperationsComponent
      },
      {
        path: '',
        redirectTo: 'instructions',
        pathMatch: 'full'
      }
    ],
    resolve: {
      simulator: SimulatorResolverService
    }
  }
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
    DragDropModule,
    SharedComponentsModule,
    C8yFactoriesModule
  ],
  providers: [
    {
      provide: HOOK_TABS,
      useClass: CustomTabFactory,
      multi: true
    },
    ThemeService
  ],
  declarations: [
    SimulatorEntryComponent,
    CreateSimComponent,
    SimulatorConfigComponent,
    SimulatorChartComponent,
    CsvImportComponent,
    AlarmsComponent,
    SimSettingsComponent,
    EditInstructionComponent,
    BulkUpdatesComponent,
    CommandQueueStatisticsComponent,
    ShowInstructionComponent,
    SupportedOperationsComponent,
    CustomOperationComponent,
    SeriesItemComponent,
    SeriesListComponent,
    SimulatorFileUploadDialog,
    BulkSimulatorsComponent,
    TemplateSelectionDialog,
    SaveSimulatorTemplateDialog,
    TemplatesListComponent,
    TemplateOverviewComponent,
    SimulatorFileUploadDialog
  ],
  entryComponents: [
    SimulatorEntryComponent,
    CreateSimComponent,
    SimulatorConfigComponent,
    SimulatorChartComponent,
    CsvImportComponent,
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
    BulkSimulatorsComponent,
    TemplateSelectionDialog,
    SaveSimulatorTemplateDialog,
    TemplatesListComponent,
    TemplateOverviewComponent
  ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
