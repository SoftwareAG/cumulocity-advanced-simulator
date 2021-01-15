import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule, Routes } from '@angular/router';
import { CoreModule, BootstrapComponent, RouterModule, HOOK_NAVIGATOR_NODES } from '@c8y/ngx-components';
import { SimulatorEntryComponent } from './src/simulator-entry/simulator-entry.component';
import { NavFactory } from './factories/Navigation';
import { CreateSimComponent } from './src/create-sim/create-sim.component';

const appRoutes: Routes = [
  { path: '', component: SimulatorEntryComponent },
  { path: 'createSim', component: CreateSimComponent },
]

@NgModule({
  
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    ngRouterModule.forRoot(appRoutes, { enableTracing: false, useHash: true }),
    CoreModule.forRoot()
  ],
  declarations: [SimulatorEntryComponent, CreateSimComponent],
  // entryComponents: [SimulatorEntryComponent],
  // providers: [
  //   { provide: HOOK_NAVIGATOR_NODES, useClass: NavFactory, multi: true}
  // ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
