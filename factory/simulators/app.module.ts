import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule, Routes } from '@angular/router';
import { CoreModule, BootstrapComponent, RouterModule, HOOK_NAVIGATOR_NODES } from '@c8y/ngx-components';
// import { SimulatorEntryComponent } from './src/modules/simulator-entry/simulator-entry.component';
// RECOMMENDED
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SimulatorEntryComponent } from './src/modules/simulator-entry/simulator-entry.component';
import { NavFactory } from './factories/Navigation';
import { CreateSimComponent } from './src/modules/create-sim/create-sim.component';
import { SimulatorConfigComponent } from './src/modules/simulator-config/simulator-config.component';

const appRoutes: Routes = [
  { path: '', component: SimulatorEntryComponent },
  { path: 'createSim', component: CreateSimComponent },
]

@NgModule({
  
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    BsDropdownModule.forRoot(),
    ngRouterModule.forRoot(appRoutes, { enableTracing: false, useHash: true }),
    CoreModule.forRoot()
  ],
  declarations: [SimulatorEntryComponent, CreateSimComponent, SimulatorConfigComponent],
  entryComponents: [SimulatorEntryComponent, CreateSimComponent, SimulatorConfigComponent],
  // providers: [
  //   { provide: HOOK_NAVIGATOR_NODES, useClass: NavFactory, multi: true}
  // ],
  
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
