import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CountPipe } from './pipes/count.pipe';
import { InstructionTypePipe } from './pipes/instructionType.pipe';
import { IsNumberPipe } from './pipes/isNumber.pipe';
import { IsValuePipe } from './pipes/isValue.pipe';
import { ToStringPipe } from './pipes/toString.pipe';
import { WarningModalComponent } from './components/warning-modal/warning-modal.component';

@NgModule({
  declarations: [IsValuePipe, ToStringPipe, IsNumberPipe, InstructionTypePipe, CountPipe, WarningModalComponent],
  exports: [IsValuePipe, ToStringPipe, IsNumberPipe, InstructionTypePipe, CountPipe, WarningModalComponent],
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule.forChild({})]
})
export class SharedComponentsModule {}
