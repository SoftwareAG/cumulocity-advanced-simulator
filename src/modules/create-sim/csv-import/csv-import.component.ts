import { Component, Input, OnInit } from '@angular/core';
import { IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { DefaultConfig } from '@models/inputFields.const';
import { InstructionCategory, SmartInstruction, SmartRestInstruction } from '@models/instruction.model';
import { InstructionService } from '@services/Instruction.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';


@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.scss']
})
export class CsvImportComponent implements OnInit {
  instructionCategories: InstructionCategory[] = DefaultConfig;
  smartRestCategory: InstructionCategory = InstructionCategory.SmartRest;

  
  choosenInstructionCategory: InstructionCategory;
  smartRestSelectedConfig;
  step = 1;
  file:any;
  delimiter:string = ';';
  data: string[][] = [];
  dataPoints: number;
  dataProperties: string[] = [];
  @Input() smartRestConfig;
  @Input() indexedCommandQueue: IndexedCommandQueueEntry[];
  
  constructor(
    private simSettings: SimulatorSettingsService,
    private instructionService: InstructionService
    ) { }

  ngOnInit() {
    console.error(this.smartRestConfig, this.smartRestCategory);
  }
  categoryChange(event) {
    console.error(event, this.smartRestSelectedConfig);
  }

  autoMapping() {
    let succeededMappings = 0;
    for (let smartRestField of this.smartRestSelectedConfig.smartRestFields.customValues){
      let index = 0;
      for(let csvProperty of this.dataProperties){
        if (smartRestField.path.includes(csvProperty)) {
          smartRestField['csvProperty'] = csvProperty;
          smartRestField['csvValues'] = this.data[index];
          succeededMappings++;
          break;
        }
        index++;
      }
    }
    
    console.log(`${succeededMappings} of ${this.smartRestSelectedConfig.smartRestFields.customValues.length} successfully mapped`);
    console.log(this.smartRestSelectedConfig);
  }
  
  mapDataToSmartRest(smartRestField, csvProperty:string, i:number) {
    console.info(csvProperty, smartRestField, i , this.data);
    smartRestField['csvProperty'] = csvProperty;
    smartRestField['csvValues'] = this.data[i];
    console.log(this.smartRestSelectedConfig);
  }

  startImport() {
    let valuePosition = 0;
    let smartRestInstructions: SmartRestInstruction[] = [];
    for (let i = 0; i < this.dataPoints; i++){
      let smartRestInstruction = {
        type: InstructionCategory.SmartRest
      } as SmartInstruction;
      for (let smartRestField of this.smartRestSelectedConfig.smartRestFields.customValues) {

        smartRestInstruction[smartRestField['path']] = '';

        if (smartRestField['csvValues']){
          smartRestInstruction[smartRestField['path']] = smartRestField['csvValues'][valuePosition];
          valuePosition++;
        }

     /*   let indexedCommandQueueEntry = { ...smartRestCommandQueueEntry, index: 'single' };
        this.indexedCommandQueue.push(indexedCommandQueueEntry);
*/
      }
      smartRestInstructions.push(smartRestInstruction as SmartRestInstruction);

      const smartRestCommandQueueEntry = this.instructionService.smartRestInstructionToCommand(smartRestInstruction);
      console.error(smartRestInstruction, smartRestCommandQueueEntry);
      let indexedCommandQueueEntry = { ...smartRestCommandQueueEntry, index: 'single' };
      this.indexedCommandQueue.push(indexedCommandQueueEntry);
      this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
      //this.updateCommandQueueInManagedObject(this.updateService.mo, 'SmartRest');
    }
  }
      /*

  const temp = this.smartRestSelectedConfig.smartRestFields.customValues;
      this.smartRestInstruction = ;
temp.map((entry) => this.smartRestInstruction[entry.path] = '');

      const smartRestCommandQueueEntry = this.instructionService.smartRestInstructionToCommand(this.smartRestInstruction);
      let indexedCommandQueueEntry = { ...smartRestCommandQueueEntry, index: 'single' };
      if (this.commandQueueEntryIndex) {

        this.indexedCommandQueue.splice(this.commandQueueEntryIndex + 1, 0, indexedCommandQueueEntry);
      } else {
        this.indexedCommandQueue.push(indexedCommandQueueEntry);
      }

      this.simSettings.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
      this.updateCommandQueueInManagedObject(this.updateService.mo, 'SmartRest');
    */

  incrementStep() {
    this.step++;
    switch(this.step){
      case 2: this.readFileStream();break;
      case 4: this.startImport();break;
    }
  }
  
  prepareFileStream(event) {
    console.log(event);
    this.file = event.target.files[0];
  }

  changeDelimiter(event) {
    console.log(event);

  }

  readFileStream() {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let fileContent = String(fileReader.result);
      this.dataProperties = fileContent.split('\r\n')[0].split(this.delimiter);
      let data = fileContent.split(this.delimiter);
      for (let i = 0; i < this.dataProperties.length; i++){
        this.data.push([]);
        for (let j = i; j < data.length; j += this.dataProperties.length-1){
          if(j < this.dataProperties.length){ continue; }
          this.data[this.data.length-1].push(data[j]);
        }
        this.dataPoints = this.data[this.data.length - 1].length;
      }
      console.log('data', this.data, this.dataPoints);
    }
    fileReader.readAsText(this.file);
  }


}
