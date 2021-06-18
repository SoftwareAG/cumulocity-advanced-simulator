import { Component, Input, OnInit, Output } from '@angular/core';
import { IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { Alert, AlertService } from "@c8y/ngx-components";
import { DefaultConfig } from '@models/inputFields.const';
import { InstructionCategory, SeriesInstruction, SmartInstruction, SmartRestInstruction, SeriesCSVInstruction } from '@models/instruction.model';
import { InstructionService } from '@services/Instruction.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { SimulatorsServiceService } from "@services/simulatorsService.service";
import { ManagedObjectUpdateService } from "@services/ManagedObjectUpdate.service";
import { IManagedObject } from "@c8y/client";

@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.scss']
})
export class CsvImportComponent implements OnInit {
  instructionCategories: InstructionCategory[] = DefaultConfig;
  smartRestCategory: InstructionCategory = InstructionCategory.SmartRest;

  
  choosenInstructionCategory: InstructionCategory = this.smartRestCategory;
  smartRestSelectedConfig;
  step = 1;
  file:any;
  delimiter:string;
  data: string[][] = [];
  dataPoints: number;
  mappingsDone = 0;
  dataProperties: string[] = [];
  @Input() smartRestConfig;
  @Input() indexedCommandQueue: IndexedCommandQueueEntry[];
  openCSVView = false;
  @Input() allInstructionsSeries;
  
  constructor(
    private simSettingsService: SimulatorSettingsService,
    private instructionService: InstructionService,
    private updateService: ManagedObjectUpdateService,
    private alertService: AlertService,
    private simulatorervice: SimulatorsServiceService
    ) { }

  ngOnInit() {
  }
  deepCopy(obj){
    return JSON.parse(JSON.stringify(obj));
  }
  closeCSVModal() {
    this.openCSVView = false;
  }
  openCSVModal() {
    this.openCSVView = true;
    this.dataProperties = [];
    this.mappingsDone = 0;
    this.data = [];
    this.step = 1;
  }
  autoMapping() {
    let succeededMappings = 0;
    let checkedDataProperties = this.deepCopy(this.dataProperties);
    let filteredCustomValues = this.smartRestSelectedConfig.smartRestFields.customValues.filter(a => !a.value);
    for (let smartRestField of filteredCustomValues){
      for (let i = 0; i < checkedDataProperties.length; i++){
        let csvProperty = checkedDataProperties[i];
        if (smartRestField.path.includes(csvProperty)) {
          smartRestField['csvProperty'] = csvProperty;
          smartRestField['csvValues'] = this.data[i];
          succeededMappings++;
          this.mappingsDone++;
          checkedDataProperties.splice(i,1);
          this.data.splice(i,1);
          break;
        }
      }
    }
    if (succeededMappings > 0){
      this.successMessage(`${succeededMappings} of ${filteredCustomValues.length} successfully mapped`);
    } else {
      this.sendToast('No mappings possible', 'info');
    }
  }
  
  mapDataToSmartRest(smartRestField, csvProperty:string, i:number) {
    smartRestField['csvProperty'] = csvProperty;
    smartRestField['csvValues'] = this.data[i];
    this.mappingsDone++;
  }

  startImport() {
    let smartRestInstructions: SmartRestInstruction[] = [];
    const assignedIndex: string = this.allInstructionsSeries.length.toString();


    for (let i = 0; i < this.dataPoints; i++){
      let smartRestInstruction = {
        type: InstructionCategory.SmartRest
      } as SmartInstruction;
      for (let smartRestField of this.smartRestSelectedConfig.smartRestFields.customValues) {
        if(smartRestField.value !== null){continue;}

        smartRestInstruction[smartRestField['path']] = '';

        if (smartRestField['csvValues']){
          smartRestInstruction[smartRestField['path']] = smartRestField['csvValues'][i];
        }
      }
      smartRestInstructions.push(smartRestInstruction as SmartRestInstruction);

      const smartRestCommandQueueEntry = this.instructionService.smartRestInstructionToCommand(smartRestInstruction, this.smartRestSelectedConfig);

      let indexedCommandQueueEntry = { ...smartRestCommandQueueEntry, index: assignedIndex };

      
      this.indexedCommandQueue.push(indexedCommandQueueEntry);
      this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
      this.updateCommandQueueInManagedObject(this.updateService.mo, 'SmartRest');
      this.closeCSV();
    }


    this.simSettingsService.pushToInstructionsArray({
      index: assignedIndex,
      numberOfImportedInstructions: String(this.dataPoints),
      color: '#fff'
    } as SeriesCSVInstruction);

    this.updateService.mo.c8y_Series = this.simSettingsService.allInstructionsArray;
    this.updateService
    .updateSimulatorObject(this.updateService.mo)
    .then((res) => {
      this.simSettingsService.setAllInstructionsSeries(res.c8y_Series);
      });
      
  }


  updateCommandQueueInManagedObject(mo: IManagedObject, type: string) {
    this.simulatorervice.updateSimulatorManagedObject(mo).then(
      () => {
        this.successMessage('Import was successful.');
      },
      () => {
        this.errorMessage('Import failed with an error.');
      }
    );


  }
  
  goBack(){
    if(this.step > 1){
      this.step--;
    }
  }

  sendToast(text: string, type: string) {
    const alert = {
      text: text,
      type: type,
    } as Alert;
    this.alertService.add(alert);
  }
  successMessage(text: string) {
    this.sendToast(text, 'success');
  }
  errorMessage(text: string) {
    this.sendToast(text, 'danger');
  }

  validateInputFields() {
    let valid = true;
    if (this.step === 1) {
      if(!this.delimiter || !this.file){
        this.errorMessage((!this.delimiter) ? 'Delimiter is not set.' : 'File is not uploaded.');
        valid = false;
      }
    }
    if (this.step === 2) {
      if (!this.choosenInstructionCategory || !this.smartRestSelectedConfig){
        this.errorMessage((!this.choosenInstructionCategory) ? 'Please select a category.' : 'Please select a Smartrest Template.');
        valid = false;
      }
    }
    if (this.step === 3) {
      if (this.mappingsDone === 0){
        this.errorMessage('Without any mappings no data will be imported');
        valid = false;
      }
    }
    return valid;
  }

  incrementStep() {
    if(!this.validateInputFields()){
      return;
    }
    this.step++;
    switch(this.step){
      case 2: this.readFileStream();break;
      case 4: this.startImport();break;
    }
  }
  
  prepareFileStream(event) {
   this.file = event.target.files[0];
  }


  readFileStream() {
    if(this.dataProperties && this.dataPoints){
      return;
    }
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let fileContent = String(fileReader.result);
      if(!fileContent.includes(this.delimiter)){
          this.step--;
          this.errorMessage('Delimiter not found in CSV');
          return;
      }
      this.dataProperties = fileContent.split('\r\n')[0].split(this.delimiter);

      let data = fileContent.replace(/\r\n/g, ',').split(this.delimiter);
      for (let i = 0; i < this.dataProperties.length; i++){
        this.data.push([]);
        for (let j = i; j < data.length; j += this.dataProperties.length){
          if(j < this.dataProperties.length){ continue; }
          this.data[this.data.length-1].push(data[j]);
        }
        this.dataPoints = this.data[this.data.length - 1].length;
      }
    }
    fileReader.readAsText(this.file);
  }


}
