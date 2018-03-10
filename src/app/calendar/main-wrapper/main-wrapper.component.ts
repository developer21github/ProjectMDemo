import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivityFormComponent} from '../activity-form/activity-form.component';
import {BsModalService} from 'ngx-bootstrap';
import {CalendarService} from '../calendar.service';
import {UserService} from '../../users/user.service';
import {ToastsManager} from 'ng2-toastr';

import 'rxjs/add/operator/takeWhile';

@Component({
    selector: 'app-main-wrapper',
    templateUrl: './main-wrapper.component.pug',
    styleUrls: ['./main-wrapper.component.less']
})
export class MainWrapperComponent implements OnInit, OnDestroy {
    activityModal;
    showSyncLoader = true;
    componentInView = false;

    constructor(private modalService: BsModalService, private calendar: CalendarService, private user: UserService, private toaster: ToastsManager) {
    }

    ngOnInit() {
        this.componentInView = true;
        // this should be checked on routes but still being extra conscious.
        if (this.user.isLoggedIn) {
            this.calendar.onSync()
                .takeWhile(() => this.componentInView)
                .subscribe((data: boolean) => {
                    this.showSyncLoader = data;
                });
        }
    }

    ngOnDestroy() {
        this.componentInView = false;
    }

    syncNow() {
        this.calendar.syncCalendar();
    }

    addActivityClicked() {
        const config = {
            class: 'modal-lg'
        };

        this.activityModal = this.modalService.show(ActivityFormComponent, config);
        this.modalService.onHide.subscribe(data => {
            // this.calendar.createEvent(data);
        }, err => {

        });
    }

}
