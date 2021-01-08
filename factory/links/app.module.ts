import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule, Routes } from '@angular/router';
import { CoreModule, BootstrapComponent, RouterModule, HOOK_NAVIGATOR_NODES } from '@c8y/ngx-components';
import { DevicesComponent } from './components/devices/devices.component';
import { HelloComponent } from './components/hello/hello.component';
import { NavigationFactory } from './components/factories/Navigation';

const appRoutes: Routes = [
  { path: 'hello', component: HelloComponent},
  { path: 'devices',component: DevicesComponent}
]

@NgModule({
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    ngRouterModule.forRoot( 
      appRoutes,
      { enableTracing: false, useHash: true }),
    CoreModule.forRoot(),
  ],
  declarations:[
    HelloComponent, 
    DevicesComponent],

  providers: [
    {
      provide: HOOK_NAVIGATOR_NODES, useClass: NavigationFactory, multi: true
    }],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
