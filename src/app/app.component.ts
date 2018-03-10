import {Component, ViewContainerRef} from '@angular/core';
import {Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';

import {Constants} from './constants';
import {UserService} from './users/user.service';
import {SessionModalComponent} from './shared/session-modal/session-modal.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.pug',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    bsModalRef: BsModalRef;

    constructor(public toastr: ToastsManager, vRef: ViewContainerRef,
                private user: UserService,
                private modalService: BsModalService,
                private router: Router) {
        this.toastr.setRootViewContainerRef(vRef);
        this.user.onSessionDestroyed.subscribe(data => {
            this.showLogoutPopup();
        });
    }

    showLogoutPopup() {
        const initialState = {
            title: 'Session has been closed',
            body: 'Session has been closed.',
            closeBtnName: 'OK'
        };
        this.bsModalRef = this.modalService.show(SessionModalComponent, {initialState});
        this.modalService.onHide.subscribe(data => {
            this.router.navigate([Constants.APP_URLS.login]);
        }, err => {

        });
    }
}
