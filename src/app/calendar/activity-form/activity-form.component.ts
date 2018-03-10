import {Component, OnDestroy, OnInit} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {CalendarService} from '../calendar.service';
import {co} from 'co';
import {ToastsManager} from 'ng2-toastr';
import {UserService} from '../../users/user.service';
import * as moment from 'moment';
import {CompaniesService} from '../../companies/companies.service';
import {ProjectsService} from '../../projects/projects.service';

@Component({
    selector: 'app-activity-form',
    templateUrl: './activity-form.component.pug',
    styleUrls: ['./activity-form.component.less']
})
export class ActivityFormComponent implements OnInit, OnDestroy {

    public events = [];
    public eventData: any;
    public update = false;
    public projects = [];
    public contacts = [];
    public companies = [];
    public preSelectedCompany = null;
    public preSelectedProject = null;

    public selectedCompanies = [];
    public selectedProjects = [];
    public selectedContacts = [];


    public TYPES = {
        call: 'CALL',
        email: 'EMAIL',
        meeting: 'MEETING',
        notes: 'NOTES'
    };
    public etype = this.TYPES.call;
    public STATUSES = {
        complete: 'COMPLETE',
        incomplete: 'IN_COMPLETE'
    };

    public COMPANIES_CAT = 'COMPANY';
    public PROJECTS_CAT = 'PROJECT';
    public CONTACT_CAT = 'CONTACT';

    public status = false;
    public showLoader = false;
    public startDate = null;
    public event: any = {
        startDate: new Date(),
        startTime: new Date(),
        title: '',
        completed: '',
        hours: 0,
        minutes: 0,
        description: '',
        categories: [],
        organizer: {
            name: '',
            email: ''
        }
    };
    public componentInView = true;

    constructor(private service: BsModalService,
                private modalRef: BsModalRef,
                private calendarService: CalendarService,
                private toaster: ToastsManager,
                private userService: UserService,
                private companiesService: CompaniesService,
                private projectsService: ProjectsService) {

    }

    ngOnInit() {
        if (this.eventData) {
            this.update = true;
            this.populateEventData();
        } else if (this.startDate) {
            this.event.startDate = this.startDate;
            this.event.startTime = this.startDate;
            this.postInitProcessing();
        } else {
            this.postInitProcessing();
        }



        this.events = this.calendarService.events;
        this.calendarService.getEventsNotifications()
            .takeWhile(() => this.componentInView)
            .subscribe(data => {
                this.events = data;
            });
    }


    postInitProcessing() {
        this.event.organizer.name = this.userService.name;
        this.event.organizer.email = this.userService.email;

        if (this.preSelectedProject) {
            this.projectsService.getProjectsWithFilter(this.projectsService.filters.byId, this.preSelectedProject)
                .subscribe(data => {
                    this.selectedProjects = [];
                    this.selectedProjects.push(data[0]);
                });
        }

        if (this.preSelectedCompany) {
            this.companiesService.getCompaniesWithFilter(this.companiesService.filters.byId, this.preSelectedCompany)
                .subscribe(data => {
                    this.selectedCompanies = [];
                    this.selectedCompanies.push(data[0]);
                });
        }
    }

    populateEventData() {
        this.event = this.eventData;

        this.event.startDate = new Date(this.eventData.start.toDate());
        this.event.startTime = new Date(this.eventData.start.toDate());

        if (!this.eventData.end) {
            this.eventData.end = this.eventData.start;
        }

        const duration = moment.duration(this.eventData.end.diff(this.eventData.start));
        this.event.minutes = duration.asMinutes();
        this.event.hours = Math.floor(this.event.minutes / 60);
        this.event.minutes = this.event.minutes % 60;


        if (this.eventData.categories) {
            Object.keys(this.TYPES).forEach(type => {
                const index = this.eventData.categories.indexOf(this.TYPES[type]);
                if (index > -1) {
                    this.setType(this.TYPES[type]);
                }
            });

            Object.keys(this.STATUSES).forEach(status => {
                const index = this.eventData.categories.indexOf(this.STATUSES[status]);
                if (index > -1) {
                    if (this.STATUSES[status] === this.STATUSES.complete) {
                        this.status = true;
                    }

                    if (this.STATUSES[status] === this.STATUSES.incomplete) {
                        this.status = false;
                    }
                }
            });

            this.selectedCompanies = [];
            this.eventData.categories.forEach(cat => {
                if (cat.indexOf(this.COMPANIES_CAT) === 0) {
                    const companyId = parseInt(cat.substr(this.COMPANIES_CAT.length), 10);
                    this.companiesService.getCompaniesWithFilter(this.companiesService.filters.byId, companyId).subscribe(data => {
                        if (data.length > 0) {
                            this.selectedCompanies.push(data[0]);
                        }
                    });
                }

                if (cat.indexOf(this.PROJECTS_CAT) === 0) {
                    const projectId = parseInt(cat.substr(this.PROJECTS_CAT.length), 10);
                    this.projectsService.getProjectsWithFilter(this.projectsService.filters.byId, projectId).subscribe(data => {
                        if (data.length > 0) {
                            this.selectedProjects.push(data[0]);
                        }
                    });
                }

                if (cat.indexOf(this.CONTACT_CAT) === 0) {
                    const contactId = parseInt(cat.substr(this.CONTACT_CAT.length), 10);
                    this.companiesService.getContactsWithFilter(this.companiesService.filters.byId, contactId).subscribe(data => {
                        if (data.length > 0) {
                            this.selectedContacts.push(data[0]);
                        }
                    });
                }
            });
        } else {
            this.eventData.categories = [];
        }
    }

    ngOnDestroy() {
        this.componentInView = false;
    }

    setType(type) {
        this.etype = type;
    }

    validate() {
        let errors = '';
        if (!this.event.title || this.event.title === '') {
            errors += 'Activity title is required.';
        }
        return errors;
    }

    save() {
        const errors = this.validate();
        if (errors !== '') {
            this.toaster.error(errors);
            return;
        }
        this.showLoader = true;

        co(function* () {


            const start = new Date(this.event.startDate);
            start.setHours(this.event.startTime.getHours());
            start.setMinutes(this.event.startTime.getMinutes());

            const end = new Date(start);
            end.setHours(end.getHours() + this.event.hours);
            end.setMinutes(end.getMinutes() + this.event.minutes);

            this.event.categories = [];
            this.event.categories.push(this.etype);
            if (this.status) {
                this.event.categories.push(this.STATUSES.complete);
            } else {
                this.event.categories.push(this.STATUSES.incomplete);
            }
            this.selectedCompanies.forEach(item => {
                this.event.categories.push(this.COMPANIES_CAT + item.id);
            });

            this.selectedProjects.forEach(item => {
                this.event.categories.push(this.PROJECTS_CAT + item.id);
            });

            this.selectedContacts.forEach(item => {
                this.event.categories.push(this.CONTACT_CAT + item.id);
            });

            this.event.start = start;
            this.event.end = end;

            try {
                if (this.update) {
                    yield this.calendarService.updateEvent(this.event);
                } else {
                    yield this.calendarService.createEvent(this.event);
                }

                this.calendarService.syncCalendar();
                this.showLoader = false;
                this.modalRef.hide();
            } catch (e) {
                this.showLoader = false;
                this.toaster.error(e);
            }
        }.bind(this));

    }

    toggleStatus() {
        this.status = !this.status;
    }

    cancel() {
        this.modalRef.hide();
    }

    searchCompanies($event) {
        this.companiesService.getCompaniesWithFilter(this.companiesService.filters.byName, $event.query)
            .subscribe(data => {
                this.companies = data;
            });
    }

    searchProjects($event) {
        this.projectsService.getProjectsWithFilter(this.projectsService.filters.byName, $event.query)
            .subscribe(data => {
                this.projects = data;
            });
    }

    searchContacts($event) {
        this.companiesService.getContactsWithFilter(this.companiesService.filters.byName, $event.query)
            .subscribe(data => {
                this.contacts = data;
            });
    }

    contactSelected($event) {
        this.selectedContacts = [];
        this.selectedContacts.push($event); // we only allow one contact

        if (this.selectedCompanies.length === 0) {
            this.companiesService.getCompaniesWithFilter(this.companiesService.filters.byId, $event.company_id).subscribe(data => {
                if (data.length > 0) {
                    this.selectedCompanies.push(data[0]);
                }
            });
        }
    }


    companySelected($event) {
        this.selectedCompanies = []; // we only allow one company
        this.selectedCompanies.push($event);
    }

    projectSelected($event) {
        this.selectedProjects = []; // we only allow one project
        this.selectedProjects.push($event);
    }

}
