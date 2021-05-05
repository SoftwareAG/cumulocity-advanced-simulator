import { Component, Input } from "@angular/core";
import { Subject } from 'rxjs';
import { AlertService, Alert } from "@c8y/ngx-components";
import { IManagedObject, IManagedObjectBinary, InventoryBinaryService, InventoryService } from "@c8y/client";

export interface ILabels {
    ok?: string;
    cancel?: string;
}


@Component({
    selector: 'simulator-file-upload-dialog',
    template: `
  <c8y-modal title="{{modalTitle}}" 
    (onClose)="uploadFile($event)"
    (onDismiss)="onDismiss($event)"
    [labels]="labels">
    <ng-form>
      <div class="form-group">
      <br>
        <div class="input-group">
          <label translate>File to upload</label>  
          <input type="file" class="form-control"  (change)="selectFile($event.target.files)" />
        </div>
      </div>
    </ng-form>
  </c8y-modal>`
})
export class SimulatorFileUploadDialog {
    private closeSubject: Subject<any> = new Subject();

    public labels: ILabels = {
        ok: "Upload",
        cancel: "Cancel"
    };
    public modalTitle: string = 'Upload Simulator';
    // @Input() device: Ship;


    files: File[];
    
    constructor(
        private alertService: AlertService,
        private inventoryBinary: InventoryBinaryService,
        private inventory: InventoryService
    ) { }

    selectFile(files: File[]) {
        this.files = files;
    }

    uploadFile(event) {
        const file = this.files[0];
        const mo: Partial<IManagedObject> = {
            name: file.name,
            type: file.type,
            avl_SignalBatchFiles: {
              
            }
          };
          this.inventoryBinary.create(file, mo).then(result => {
            // this.inventory.childAdditionsAdd(result.data.id, this.device.id).then(res =>{
            //   this.onClose(result.data);
            // })
        }, error => {
            this.alertService.add({
                text: 'Error while uploading File',
                type: 'danger',
                timeout: 0
            } as Alert);
            this.onDismiss(false);
        });
    }

    onDismiss(event) {
        this.closeSubject.next(undefined);
    }

    onClose(mo: IManagedObjectBinary) {
        this.closeSubject.next(mo);
    }
}
