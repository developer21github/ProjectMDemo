import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CalendarService} from '../calendar.service';
import {HelperService} from '../../app-services/helper.service';
import {UserService} from '../../users/user.service';
import {ActivityFormComponent} from '../activity-form/activity-form.component';
import {BsModalService} from 'ngx-bootstrap';

@Component({
    selector: 'app-activity-timeline',
    templateUrl: './activity.timeline.component.pug',
    styleUrls: ['./activity.timeline.component.less']
})
export class ActivityTimelineComponent implements OnInit, OnDestroy {

    @Input() company;
    @Input() project;

    public activities = [];
    public eventsLoaded = false;
    private componentInView = false;
    public activityModal;

    constructor(public calendarService: CalendarService,
                public helper: HelperService,
                private modalService: BsModalService,
                public user: UserService) {
    }

    ngOnInit() {
        this.componentInView = true;
        this.applyFilters(this.calendarService.events);

        if (this.calendarService.initialised) {
            this.eventsLoaded = true;
        }
        this.calendarService.getEventsNotifications()
            .takeWhile(() => this.componentInView)
            .subscribe((data) => {
                this.applyFilters(data);
                this.eventsLoaded = true;
            });
    }

    applyFilters(data) {
        this.activities = data;
        if (this.company) {
            this.activities = this.activities.filter(event => event.companies && event.companies[0] === parseInt(this.company, 10));
        }
        if (this.project) {
            this.activities = this.activities.filter(event => event.projects && event.projects[0] === parseInt(this.project, 10));
        }

    }

    ngOnDestroy() {
        this.componentInView = false;
    }

    addActivityClicked() {
        const config = {
            class: 'modal-lg',
            initialState: {preSelectedCompany: this.company, preSelectedProject: this.project}
        };

        this.activityModal = this.modalService.show(ActivityFormComponent, config);
        this.modalService.onHide.subscribe(data => {
            // this.calendar.createEvent(data);
        }, err => {

        });
    }

}
