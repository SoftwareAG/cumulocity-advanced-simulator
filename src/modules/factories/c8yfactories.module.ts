import { NgModule } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HOOK_ACTION_BAR, HOOK_NAVIGATOR_NODES, HOOK_TABS } from '@c8y/ngx-components';
import { CustomTabFactory } from './tab.factory';

@NgModule({
  imports: [CommonModule, BsDropdownModule, TranslateModule],
  providers: [
    {
      provide: HOOK_TABS,
      useClass: CustomTabFactory,
      multi: true
    },
  ],
  declarations: [],
  entryComponents: [],
})
export class C8yFactoriesModule {
  constructor() {}
}
