import { Component, OnInit } from "@angular/core";
import { TemplateModel } from "@models/template.model";
import { TemplateSelectionDialog } from "@modules/simulator-entry/template-selection-dialog";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";

@Component({
  selector: "app-templates-list",
  templateUrl: "./templates-list.component.html",
  styleUrls: ["./templates-list.component.scss"],
})
export class TemplatesListComponent implements OnInit {
  allTemplates: TemplateModel[] = [];
  subscriptions = new Subscription();
  listClass = "interact-list";
  viewType = "templates-view";
  constructor(
    private simulatorService: SimulatorsServiceService,
    private modalService: BsModalService,
    private updateService: ManagedObjectUpdateService
  ) {}

  ngOnInit(): void {
    this.refreshTemplateList();
  }

  ngOnDestroy(): void {
    this.modalUnsubscribe();
  }

  openTemplateSelectionDialog(): void {
    const modal = this.modalService.show(TemplateSelectionDialog);
    modal.content.allSimulatorTemplates = this.allTemplates;
    this.subscriptions.add(
      modal.content.closeSubject.subscribe((result: boolean) => {
        if (result) {
        }
        this.modalUnsubscribe();
      })
    );
  }

  deleteTemplate(template: TemplateModel): void {
    this.simulatorService.deleteTemplate(template.id).then((res) => {
      this.updateService.simulatorUpdateFeedback('success', 'Template deleted successfully');
      this.refreshTemplateList();
    });
  }

  private modalUnsubscribe(): void {
    this.subscriptions.unsubscribe();
  }

  refreshTemplateList() {
    this.simulatorService.getAllTemplates().then((res) => {
      this.allTemplates = res as TemplateModel[];
    });
  }
}

