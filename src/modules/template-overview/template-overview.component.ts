import { Component, OnInit } from "@angular/core";
import { CustomSimulator } from "@models/simulator.model";
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { IManagedObject } from "@c8y/client";
import { ActivatedRoute, Router } from "@angular/router";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { TemplateModel } from "@models/template.model";

@Component({
  selector: "app-template-overview",
  templateUrl: "./template-overview.component.html",
  styleUrls: ["./template-overview.component.scss"],
})
export class TemplateOverviewComponent implements OnInit {
  allSimulatorsFromTemplate: CustomSimulator[] = [];
  templateTitle: string;
  listClass = 'interact-list';
  editMode = false;
  mo: Partial<IManagedObject> | IManagedObject;
  constructor(
    private simulatorService: SimulatorsServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private updateService: ManagedObjectUpdateService
  ) {}

  ngOnInit(): void {
    this.mo = this.route.snapshot.data.template.data;
    this.templateTitle = this.mo.name;
    this.getSimulatorsCorrespondingToTemplate(this.mo.id);
  }

  getSimulatorsCorrespondingToTemplate(templateId: string): void {
    this.simulatorService.getSimulatorsFromTemplate(templateId).then((res) => {
      this.allSimulatorsFromTemplate = res as CustomSimulator[];
      console.log(this.allSimulatorsFromTemplate);
    });
  }

  editTemplateTitle() {
    this.mo.name = this.templateTitle;
    this.updateService.updateTemplateObject(this.mo as TemplateModel).then((res) => {
      this.editMode = false;
    });
  }

  redirectToSimulator(simulator: CustomSimulator) {
    this.router.navigate(['createSim/'+simulator.id]);
  }
}
