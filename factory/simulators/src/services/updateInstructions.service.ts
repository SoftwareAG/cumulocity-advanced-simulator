import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { EditedMeasurement } from "src/models/editedMeasurement.model";

@Injectable({
  providedIn: "root",
})
export class UpdateInstructionsService {
  private editedMsmtObserver = new BehaviorSubject<EditedMeasurement>(null);
  private addInstructionOrSleepObserver = new BehaviorSubject<boolean>(false);
  castMeasurement = this.editedMsmtObserver.asObservable();  
  castInstructionsOrSleep = this.addInstructionOrSleepObserver.asObservable();  

  constructor() {}

  getEditedMeasurements(): Observable<EditedMeasurement> {
    return this.editedMsmtObserver.asObservable();
  }

  setEditedMeasurement(edited: EditedMeasurement) {
    this.editedMsmtObserver.next(edited);
  }

  setInstructionsView(val: boolean) {
    this.addInstructionOrSleepObserver.next(val);
  }
}
