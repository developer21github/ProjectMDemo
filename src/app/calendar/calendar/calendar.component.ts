import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToastsManager} from 'ng2-toastr';
import {CalendarService} from '../calendar.service';
import 'rxjs/add/operator/takeWhile';
import {ActivityFormComponent} from '../activity-form/activity-form.component';
import {BsModalService} from 'ngx-bootstrap';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.pug',
    styleUrls: ['./calendar.component.less']
})
export class CalendarComponent implements OnInit, OnDestroy {
    events = [];
    header;
    componentInView;
    activityModal;

    constructor(private calendarService: CalendarService,
                private toaster: ToastsManager,
                private modalService: BsModalService) {
    }

    ngOnInit() {
        this.componentInView = true;
        this.header = {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        };

        this.events = this.calendarService.events;
        this.calendarService.getEventsNotifications()
            .takeWhile(() => this.componentInView)
            .subscribe(data => {
                this.events = data;
            });
    }

    ngOnDestroy() {
        this.componentInView = false;
    }

    onEventClick(event) {
        const config = {
            class: 'modal-lg',
            initialState: {eventData: event.calEvent}
        };

        this.activityModal = this.modalService.show(ActivityFormComponent, config);
        this.modalService.onHide.subscribe(data => {
            // this.calendar.createEvent(data);
        }, err => {

        });
    }

    onDayClicked(event) {
        const startDate = new Date(event.date.toDate());
        if ( event.view.name === 'month') {
            const timeNow = new Date();
            startDate.setHours(timeNow.getHours());
            startDate.setMinutes(timeNow.getMinutes());
        }
        const config = {
            class: 'modal-lg',
            initialState: {startDate}
        };

        this.activityModal = this.modalService.show(ActivityFormComponent, config);
        this.modalService.onHide.subscribe(data => {
            // this.calendar.createEvent(data);
        }, err => {

        });
    }

    onEventDrop(event) {
        if (event.event.end === null) {
            event.event.end = new Date(event.event.start);
        }
        this.calendarService.updateEvent(event.event);
    }

}
