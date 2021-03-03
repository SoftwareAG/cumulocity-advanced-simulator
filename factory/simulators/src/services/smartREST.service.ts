import { Injectable } from '@angular/core';
import { CommandQueueEntry } from '@models/commandQueue.model';
import { SmartRest } from '@models/smartREST.model';

@Injectable({
  providedIn: 'root'
})
export class SmartRESTService {

constructor() { }

smartRESTTemplateToCommandQueueEntry(smartRestEntry: any, smartRESTTemplate: SmartRest): CommandQueueEntry {
  let commandQueueEntry: CommandQueueEntry = {
    messageId: '',
    templateId: '',
    values: [],
    type: 'message'
  };
  Object.values(smartRestEntry).forEach((field) => commandQueueEntry.values.push(field as string));
  commandQueueEntry.messageId = smartRESTTemplate.smartRestFields.msgId;
  commandQueueEntry.templateId = smartRESTTemplate.templateId;
  return commandQueueEntry;
}
}
