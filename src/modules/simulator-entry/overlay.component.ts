import { AfterViewInit, TemplateRef } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ILabels } from '@models/overlayLabels.const';
import { OverlayService } from '@services/Overlay.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-overlay',
  template: `<c8y-modal
    title="{{ modalTitle }}"
    (onClose)="doNothing($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels"
  >
    <ng-form>
      <div class="form-group">
        <br />
        <div class="input-group">
          <ng-container *ngTemplateOutlet="header; context: templateCtx"></ng-container>
          <!-- <ng-content></ng-content> -->
        </div>
      </div>
    </ng-form>
  </c8y-modal>`
})
export class OverlayComponent implements OnInit, AfterViewInit {
  private closeSubject: Subject<any> = new Subject();
  @Input() header: TemplateRef<any>;
  templateCtx: { item: any };
  
  @Input() modalTitle: string;
  @Input() labels: ILabels;
  @Input() name: string;
  

  constructor(private overlayService: OverlayService) {}

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    
  }

  doNothing(event) {
    if (this.labels && this.labels.type === 'upload') {
      this.overlayService.upload(event);
      console.log('filename: ', this.name);
    }
  }

  onDismiss(event) {
    this.closeSubject.next(undefined);
  }

  onClose(event) {
    this.closeSubject.next(event);
  }
}
