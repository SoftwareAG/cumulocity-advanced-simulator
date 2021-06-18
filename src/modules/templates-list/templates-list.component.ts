import { Component, OnInit } from '@angular/core';
import { TemplateModel } from '@models/template.model';
import { SimulatorsServiceService } from '@services/simulatorsService.service';

@Component({
  selector: 'app-templates-list',
  templateUrl: './templates-list.component.html',
  styleUrls: ['./templates-list.component.scss']
})
export class TemplatesListComponent implements OnInit {

  allTemplates: TemplateModel[] = [];
  listClass = 'interact-list';
  constructor(private simulatorService: SimulatorsServiceService) { }

  ngOnInit() {
    this.simulatorService.getAllTemplates().then((res) => {
      this.allTemplates = res as TemplateModel[];
    });
  }

}
