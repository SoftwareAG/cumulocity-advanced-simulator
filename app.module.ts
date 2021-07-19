import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule as ngRouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { CoreModule, BootstrapComponent, RouterModule } from '@c8y/ngx-components';
// import { SimulatorEntryComponent } from '@modules/simulator-entry/simulator-entry.component';
// RECOMMENDED
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
import { BulkUpdatesComponent } from '@modules/bulk-updates/bulk-updates.component';
import { SimulatorFileUploadDialog } from '@modules/create-sim/sim-settings/simulator-file-upload-dialog';
import { SharedComponentsModule } from '@shared/shared.module';
import { OverlayComponent } from '@modules/simulator-entry/overlay.component';

const appRoutes: Routes = [
  { path: '', component: SimulatorEntryComponent },
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
    SharedComponentsModule
  ],
  declarations: [
    SimulatorEntryComponent,
    CreateSimComponent,
    SimulatorConfigComponent,
    SimulatorChartComponent,
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
    OverlayComponent
  ],
  entryComponents: [
    SimulatorEntryComponent,
    CreateSimComponent,
    SimulatorConfigComponent,
    SimulatorChartComponent,
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
    OverlayComponent
  ],
  providers: [ThemeService],

  bootstrap: [BootstrapComponent]
})
export class AppModule {}
