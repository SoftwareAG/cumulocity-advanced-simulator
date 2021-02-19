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
import { SimMeasurementsComponent } from "./src/modules/create-sim/sim-settings/sim-measurements/sim-measurements.component";
import { SimAlarmsComponent } from "./src/modules/create-sim/sim-settings/sim-alarms/sim-alarms.component";
import { SimSleepComponent } from "./src/modules/create-sim/sim-settings/sim-sleep/sim-sleep.component";
import { SimEventsComponent } from "./src/modules/create-sim/sim-settings/sim-events/sim-events.component";
import { SupportedOperationsComponent } from "@modules/supported-operations/supported-operations.component";
import { CommandQueueStatisticsComponent } from "@modules/command-queue-statistics/command-queue-statistics.component";

const appRoutes: Routes = [
  { path: "", component: SimulatorEntryComponent },
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
    ngRouterModule.forRoot(appRoutes, { enableTracing: false, useHash: true }),
    CoreModule.forRoot(),
    C8yFactoriesModule,
    ChartsModule,
  ],
  declarations: [
    SimulatorEntryComponent,
    CreateSimComponent,
    SimulatorConfigComponent,
    SimulatorChartComponent,
    AlarmsComponent,
    SimSettingsComponent,
    EditInstructionComponent,
    SimMeasurementsComponent,
    SimEventsComponent,
    CommandQueueStatisticsComponent,
    SimSleepComponent,
    ShowInstructionComponent,
    SimAlarmsComponent,
    SupportedOperationsComponent
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
    SimMeasurementsComponent,
    SimEventsComponent,
    SimSleepComponent,
    ShowInstructionComponent,
    SimAlarmsComponent,
    SupportedOperationsComponent
  ],
  providers: [ThemeService],
  // providers: [
  //   { provide: HOOK_NAVIGATOR_NODES, useClass: NavFactory, multi: true}
  // ],

  bootstrap: [BootstrapComponent],
})
export class AppModule {}
