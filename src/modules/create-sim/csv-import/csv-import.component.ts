import { Component, Input } from '@angular/core';
import { IndexedCommandQueueEntry } from '@models/commandQueue.model';
import { Alert, AlertService } from '@c8y/ngx-components';
import {
  InstructionCategory,
  SmartInstruction,
  SmartRestInstruction,
  SeriesCSVInstruction,
  MeasurementInstruction,
  Instruction
} from '@models/instruction.model';
import { InstructionService } from '@services/Instruction.service';
import { SimulatorSettingsService } from '@services/simulatorSettings.service';
import { SimulatorsServiceService } from '@services/simulatorsService.service';
import { ManagedObjectUpdateService } from '@services/ManagedObjectUpdate.service';
import { IManagedObject } from '@c8y/client';
import * as _ from 'lodash';
import { DefaultConfig } from '@constants/inputFields.const';

@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.scss']
})
export class CsvImportComponent {
  instructionCategories: InstructionCategory[] = DefaultConfig;
  smartRestCategory: InstructionCategory = InstructionCategory.SmartRest;
  measurementCategory: InstructionCategory = InstructionCategory.Measurement;

  choosenInstructionCategory: InstructionCategory = this.measurementCategory;
  step = 1;
  delimiter: string;
  data: string[][] = [];
  dataPoints: number;
  mappingsDone = 0;
  mappingInstructions: { type: InstructionCategory; keys: string[]; values: string[]; mappings: number[] }[] = [
    {
      type: InstructionCategory.Measurement,
      values: ['Fragment', 'Series', 'Value', 'Unit'],
      keys: ['fragment', 'series', 'value', 'unit'],
      mappings: []
    },
    {
      type: InstructionCategory.Sleep,
      values: ['Sleep'],
      keys: ['seconds'],
      mappings: []
    }
  ];
  dataProperties: string[] = [];
  @Input() smartRestConfig;
  @Input() indexedCommandQueue: IndexedCommandQueueEntry[];
  openCSVView = false;
  @Input() allInstructionsSeries;
  showMappedValues: boolean = false;

  smartRestSelectedConfig: any; // :any => smartresttemplates are highly flexible and you can't know what they include as key value pairs
  file: any; //same for csv file
  constructor(
    private simSettingsService: SimulatorSettingsService,
    private instructionService: InstructionService,
    private updateService: ManagedObjectUpdateService,
    private alertService: AlertService,
    private simulatorervice: SimulatorsServiceService
  ) {}

  private deepCopy(obj: string[]): string[] {
    return _.cloneDeep(obj);
  }

  closeCSVModal(): void {
    this.openCSVView = false;
  }

  toggleShowMappedValues(): void {
    this.showMappedValues = !this.showMappedValues;
  }

  openCSVModal(): void {
    this.openCSVView = true;
    this.dataProperties = [];
    this.mappingsDone = 0;
    this.data = [];
    this.step = 1;
  }

  autoMapping(): void {
    let succeededMappings = 0;
    let checkedDataProperties = this.deepCopy(this.dataProperties);
    let filteredCustomValues = this.smartRestSelectedConfig.smartRestFields.customValues.filter((a) => !a.value);
    for (let smartRestField of filteredCustomValues) {
      for (let i = 0; i < checkedDataProperties.length; i++) {
        let csvProperty = checkedDataProperties[i];
        if (smartRestField.path.includes(csvProperty)) {
          smartRestField['csvProperty'] = csvProperty;
          smartRestField['csvValues'] = this.data[i];
          succeededMappings++;
          this.mappingsDone++;
          checkedDataProperties.splice(i, 1);
          this.data.splice(i, 1);
          break;
        }
      }
    }
    if (succeededMappings > 0) {
      this.successMessage(`${succeededMappings} of ${filteredCustomValues.length} successfully mapped`);
    } else {
      this.sendToast('No mappings possible', 'info');
    }
  }

  mapDataToNonSmartRest(
    mappingInstruction,
    mappingInstructionIndex: number,
    csvProperty: string,
    csvPropertyIndex: number
  ): void {
    mappingInstruction.mappings[csvPropertyIndex] = mappingInstructionIndex;
    this.mappingsDone++;
    console.log(mappingInstruction, mappingInstructionIndex, csvProperty, csvPropertyIndex);
  }

  mapDataToSmartRest(smartRestField, csvProperty: string, i: number): void {
    smartRestField['csvProperty'] = csvProperty;
    smartRestField['csvValues'] = this.data[i];
    this.mappingsDone++;
  }

  private startImport(): void {
    const assignedIndex: string = this.allInstructionsSeries.length.toString();
    if (this.choosenInstructionCategory === this.smartRestCategory) {
      this.performRestImport(assignedIndex);
    } else {
      this.performNonRestImport(assignedIndex);
    }
  }
  private performNonRestImport(assignedIndex: string): void {
    let instructions: Instruction[] = [];
    let usedInstructionTypes = this.mappingInstructions.filter((a) => a.mappings.length > 0);

    for (let lineIndex = 0; lineIndex < this.dataPoints; lineIndex++) {
      loop1:
      for (let entry of usedInstructionTypes) {
        let instruction = { type: entry.type } as Instruction;
        loop2:
        for (let columnIndex = 0; columnIndex < entry.mappings.length; columnIndex++) {
          if (entry.mappings[columnIndex] === undefined) continue loop2;
          if (this.data[columnIndex][lineIndex] === '') continue loop1;
           let key = entry.keys[entry.mappings[columnIndex]];
          instruction[key] = this.data[columnIndex][lineIndex];
        }
        
        instructions.push(instruction);
        let indexedCommandQueueEntry = { ...this.instructionService.instructionToCommand(instruction), index: assignedIndex };
        
        console.log(entry, instructions, indexedCommandQueueEntry);
        /*
        this.indexedCommandQueue.push(indexedCommandQueueEntry);
        this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
        this.updateCommandQueueInManagedObject(this.updateService.mo);*/
      }
    }
    this.finishImport(assignedIndex);
  }
  private performRestImport(assignedIndex: string): void {
    let smartRestInstructions: SmartRestInstruction[] = [];
    for (let i = 0; i < this.dataPoints; i++) {
      let smartRestInstruction = {
        type: InstructionCategory.SmartRest
      } as SmartInstruction;
      for (let smartRestField of this.smartRestSelectedConfig.smartRestFields.customValues) {
        if (smartRestField.value !== null) {
          continue;
        }

        smartRestInstruction[smartRestField['path']] = '';

        if (smartRestField['csvValues']) {
          smartRestInstruction[smartRestField['path']] = smartRestField['csvValues'][i];
        }
      }
      smartRestInstructions.push(smartRestInstruction as SmartRestInstruction);

      const smartRestCommandQueueEntry = this.instructionService.smartRestInstructionToCommand(
        smartRestInstruction,
        this.smartRestSelectedConfig
      );

      let indexedCommandQueueEntry = { ...smartRestCommandQueueEntry, index: assignedIndex };

      this.indexedCommandQueue.push(indexedCommandQueueEntry);
      this.simSettingsService.updateCommandQueueAndIndicesFromIndexedCommandQueue(this.indexedCommandQueue);
      this.updateCommandQueueInManagedObject(this.updateService.mo);
    }
    this.finishImport(assignedIndex);
  }

  private finishImport(assignedIndex: string): void {
    this.closeCSVModal();

    this.simSettingsService.pushToInstructionsArray({
      index: assignedIndex,
      numberOfImportedInstructions: String(this.dataPoints),
      color: '#fff'
    } as SeriesCSVInstruction);

    this.updateService.mo.c8y_Series = this.simSettingsService.allInstructionsArray;
    this.updateService.updateSimulatorObject(this.updateService.mo).then((res) => {
      this.simSettingsService.setAllInstructionsSeries(res.c8y_Series);
    });
  }

  private updateCommandQueueInManagedObject(mo: IManagedObject): void {
    this.simulatorervice.updateSimulatorManagedObject(mo).then(
      () => {
        this.successMessage('Import was successful.');
      },
      () => {
        this.errorMessage('Import failed with an error.');
      }
    );
  }

  goBack(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  private sendToast(text: string, type: string): void {
    const alert = {
      text: text,
      type: type
    } as Alert;
    this.alertService.add(alert);
  }

  private successMessage(text: string): void {
    this.sendToast(text, 'success');
  }

  private errorMessage(text: string): void {
    this.sendToast(text, 'danger');
  }

  private validateInputFields(): boolean {
    let valid = true;
    if (this.step === 1) {
      if (!this.delimiter || !this.file) {
        this.errorMessage(!this.delimiter ? 'Delimiter is not set.' : 'File is not uploaded.');
        valid = false;
      }
    }
    if (this.step === 2) {
      if (this.choosenInstructionCategory === this.smartRestCategory && !this.smartRestSelectedConfig) {
        this.errorMessage('Please select a Smartrest Template.');
        valid = false;
      }
    }
    if (this.step === 3) {
      let unusedInstructionTypes = this.mappingInstructions.filter(
        (a) => a.mappings.length > 0 && a.mappings.length < a.values.length
      );

      if (this.mappingsDone === 0) {
        this.errorMessage('Without any mappings no data will be imported');
        valid = false;
      } else if (unusedInstructionTypes.length) {
        let values = '';
        for (let i = 0; i < unusedInstructionTypes[0].values.length; i++) {
          if (unusedInstructionTypes[0].mappings[i] === undefined) {
            values += unusedInstructionTypes[0].values[i] + ' ';
          }
        }
        this.errorMessage('Missing Instruction Types for ' + unusedInstructionTypes[0].type + ': ' + values);
        valid = false;
      }
    }
    return valid;
  }

  incrementStep(): void {
    if (!this.validateInputFields()) {
      return;
    }
    this.step++;
    switch (this.step) {
      case 2:
        this.readFileStream();
        break;
      case 4:
        this.startImport();
        break;
    }
  }

  prepareFileStream(event): void {
    this.file = event.target.files[0];
  }

  private readFileStream(): void {
    if (this.dataProperties && this.dataPoints) {
      return;
    }
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let fileContent = String(fileReader.result);
      if (!fileContent.includes(this.delimiter)) {
        this.step--;
        this.errorMessage('Delimiter not found in CSV');
        return;
      }
      this.dataProperties = fileContent.split('\r\n')[0].split(this.delimiter);

      let data = fileContent.replace(/\r\n/g, this.delimiter).split(this.delimiter);
      for (let i = 0; i < this.dataProperties.length; i++) {
        this.data.push([]);
        for (let j = i; j < data.length; j += this.dataProperties.length) {
          if (j < this.dataProperties.length) {
            continue;
          }
          this.data[this.data.length - 1].push(data[j]);
        }
        this.dataPoints = this.data[this.data.length - 1].length;
      }
    };
    console.info(this.data, this.dataPoints);
    fileReader.readAsText(this.file);
  }
}
