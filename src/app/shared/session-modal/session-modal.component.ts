import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
    selector: 'app-session-modal',
    templateUrl: './session-modal.component.pug',
    styleUrls: ['./session-modal.component.less']
})
export class SessionModalComponent implements OnInit {
    closeBtnName;
    title;
    body;

    constructor(public bsModalRef: BsModalRef) {
    }

    ngOnInit() {
    }

}
