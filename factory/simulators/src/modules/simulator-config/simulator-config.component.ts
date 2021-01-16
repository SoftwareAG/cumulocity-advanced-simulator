import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
export interface ILabels {
  ok?: string;
  cancel?: string;
}

@Component({
  selector: 'addCustomSimulator',
  template: `
  <c8y-modal title="Create custom Simulator" 
    (onDismiss)="onDismiss($event)"
    [labels]="labels">
    <ng-form>
      <div class="inputs">
            <div class="form-group width-33">
                <label translate>Enter custom simulator instance name *</label>
                <input class="form-control">

            </div>
        </div>
 </ng-form>
  </c8y-modal>`
})
export class SimulatorConfigComponent implements OnInit {

  private closeSubject: Subject<any> = new Subject();

  public labels: ILabels = {
    ok: "Save",
    cancel: "Cancel"
  };
  constructor() { }

  ngOnInit() {
  }

  
  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {

    this.closeSubject.next(event);
  }

}
