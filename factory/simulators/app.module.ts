import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule } from '@angular/router';
import { CoreModule, BootstrapComponent, RouterModule, HOOK_NAVIGATOR_NODES } from '@c8y/ngx-components';
import { NavFactory } from './factories/Navigation';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    ngRouterModule.forRoot([], { enableTracing: false, useHash: true }),
    CoreModule.forRoot()
  ],
  providers: [
    { provide: HOOK_NAVIGATOR_NODES, useClass: NavFactory, multi: true}
  ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
