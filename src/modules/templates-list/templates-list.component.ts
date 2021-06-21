import { Component, OnInit } from '@angular/core';
import { TemplateModel } from '@models/template.model';
import { TemplateSelectionDialog } from '@modules/simulator-entry/template-selection-dialog';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-templates-list',
  templateUrl: './templates-list.component.html',
  styleUrls: ['./templates-list.component.scss']
})
export class TemplatesListComponent implements OnInit {

  allTemplates: TemplateModel[] = [];
  subscriptions = new Subscription();
  listClass = 'interact-list';
  constructor(private simulatorService: SimulatorsServiceService,
    private modalService: BsModalService,) { }

  ngOnInit() {
    this.simulatorService.getAllTemplates().then((res) => {
      this.allTemplates = res as TemplateModel[];
    });
  }

  openTemplateSelectionDialog(): void {
    const modal = this.modalService.show(TemplateSelectionDialog);
    modal.content.allSimulatorTemplates = this.allTemplates;
    this.subscriptions.add(
      modal.content.closeSubject.subscribe((result) => {
        if (result) {
        }
        this.modalUnsubscribe();
      })
    );
  }

  modalUnsubscribe(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnDestroy(): void {
    this.modalUnsubscribe();
  }

}
