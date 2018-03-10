import {Injectable} from '@angular/core';

import co from 'co';
import * as calDav from 'aliarshad-dav/dav';
import * as calParser from 'ical';
import * as ics from 'ics-browser';

import {Subject} from 'rxjs/Subject';

@Injectable()
export class CalendarService {

    public calendars;
    public events = [];
    public activeCalendar;
    public initialised = false;
    public TYPES = {
        call: 'CALL',
        email: 'EMAIL',
        meeting: 'MEETING',
        notes: 'NOTES'
    };

    public COMPANIES_CAT = 'COMPANY';
    public PROJECTS_CAT = 'PROJECT';
    public CONTACT_CAT = 'CONTACT';

    private accessToken;
    private calDavURL;
    private davClient;
    private account;
    private syncTime = 60;
    private syncIntervalId;
    private dataEvent;
    private domain = 'localhost';
    private organizer;
    private loadingEvent = new Subject();
    private filters = [{
        type: 'comp-filter',
        attrs: {
            'name': 'VCALENDAR'
        },
        children: [{
            type: 'comp-filter',
            attrs: {
                'name': 'VEVENT'
            }
        }]
    }];

    constructor() {
        this.dataEvent = new Subject<any>();
    }

    onSync() {
        return this.loadingEvent.asObservable();
    }

    setUserAccessToken(accessToken) {
        this.accessToken = accessToken;
        const xhr = new calDav.transport.Bearer(
            {accessToken: this.accessToken}
        );
        this.davClient = new calDav.Client(xhr);
    }

    setcalDavURL(url) {
        this.calDavURL = url;
    }

    setDomain(domain) {
        this.domain = domain;
    }

    setOrganizer(name, email) {
        this.organizer = {
            name,
            email
        };
    }

    setSyncTime(seconds) {
        this.syncTime = seconds;
    }

    initialize(initSync = false, token = '', url = '') {
        if (token) {
            this.setUserAccessToken(token);
        }
        if (url) {
            this.setcalDavURL(url);
        }

        return co(function* () {
            try {
                this.account = yield this.davClient.createAccount({server: this.calDavURL});
                this.calendars = this.account.calendars;
                if (initSync && this.calendars.length > 0) {
                    this.activeCalendar = this.calendars[0];
                    yield this.syncCalendar();
                    this.startSyncInterval.bind(this)();
                    this.initialised = true;
                }
                return true;
            } catch (error) {
                console.log(error);
                throw error;
            }
        }.bind(this));
    }

    syncCalendar(calendar = this.activeCalendar) {
        this.loadingEvent.next(true);
        return co(function* () {
            try {
                yield this.davClient.syncCalendar(calendar, {filters: this.filters});
                this.populateEvents(calendar);
                this.loadingEvent.next(false);
            } catch (error) {
                this.loadingEvent.next(false);
                throw error;
            }

        }.bind(this));

    }

    startSyncInterval() {
        this.syncIntervalId = setInterval(this.syncCalendar.bind(this), this.syncTime * 1000);
    }

    stopSyncInterval() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
        }
    }

    populateEvents(calendar) {
        this.events = [];
        calendar.objects.forEach(item => {
            const icalData = calParser.parseICS(item.calendarData);
            console.log(icalData);
            Object.keys(icalData).forEach(key => {
                if (icalData[key].type === 'VEVENT') {
                    const useAbleEvent = this.makeUseableEvent(icalData[key], item);
                    this.events.push(useAbleEvent);
                }
            });
        });

        this.dataEvent.next(this.events);
    }


    getEventsNotifications() {
        return this.dataEvent.asObservable();
    }

    dateToArray(date) {
        let dateArr = [];
        dateArr.push(date.getFullYear());
        dateArr.push(date.getMonth() + 1);
        dateArr.push(date.getDate());
        dateArr.push(date.getHours());
        dateArr.push(date.getMinutes());
        return dateArr;
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    createCalObject(eventData) {
        let event: any = {};

        if (eventData.start) {
            event.start = this.dateToArray((eventData.start._isAMomentObject) ? new Date(eventData.start.toDate()) : eventData.start);
        }

        if (eventData.end) {
            event.end = this.dateToArray((eventData.start._isAMomentObject) ? new Date(eventData.end.toDate()) : eventData.end);
        }

        if (eventData.uid) {
            event.uid = eventData.uid;
        } else {
            event.uid = this.uuidv4() + '@' + this.domain;
        }

        if (eventData.title) {
            event.title = eventData.title;
        }

        if (eventData.description) {
            event.description = eventData.description;
        }

        if (eventData.categories) {
            event.categories = eventData.categories;
        }

        if (this.organizer) {
            event.organizer = this.organizer;
        }

        if (eventData.organizer) {
            event.organizer = eventData.organizer;
        }

        return event;
    }

    updateEvent(eventData) {
        return co(function* () {
            let origionalItem = eventData.origionalItem;
            eventData = this.createCalObject(eventData);

            let icalData = yield ics.createEvent(eventData);
            try {
                let calItem = origionalItem;
                calItem.calendarData = icalData.value;
                calItem.data.props.calendarData = icalData.value;

                yield this.davClient.updateCalendarObject(calItem);
            } catch (e) {
                console.log('error', e);
            }
        }.bind(this));
    }

    makeUseableEvent(eventData, item) {
        const event: any = {};
        // console.log(eventData);
        event.start = eventData.start;
        event.end = eventData.end;
        event.title = eventData.summary;
        event.uid = eventData.uid;
        event._id = eventData.uid;
        event.categories = eventData.categories;
        event.description = eventData.description;
        event.origionalItem = item;

        if (eventData.organizer) {
            event.organizer = {
                name: eventData.organizer.params.CN,
                email: eventData.organizer.val.substr(7)
            };
        } else if (this.organizer) {
            event.organizer = this.organizer;
        }

        if (event.categories) {
            Object.keys(this.TYPES).forEach(type => {
                const index = event.categories.indexOf(this.TYPES[type]);
                if (index > -1) {
                    event.etype = this.TYPES[type];
                }
            });

            event.categories.forEach(cat => {
                if (cat.indexOf(this.COMPANIES_CAT) === 0) {
                    const companyId = parseInt(cat.substr(this.COMPANIES_CAT.length), 10);
                    event.companies = [companyId];
                }

                if (cat.indexOf(this.PROJECTS_CAT) === 0) {
                    const projectId = parseInt(cat.substr(this.PROJECTS_CAT.length), 10);
                    event.projects = [projectId];
                }

                if (cat.indexOf(this.CONTACT_CAT) === 0) {
                    const contactId = parseInt(cat.substr(this.CONTACT_CAT.length), 10);
                    event.contacts = [contactId];
                }
            });
        }

        if (event.categories && event.categories.indexOf('COMPLETE') > 0) {
            event.className = ['COMPLETE'];
        }

        return event;
    }


    createEvent(eventData) {
        return co(function* () {
            eventData = this.createCalObject(eventData);
            const icalData = yield ics.createEvent(eventData);
            try {
                let calItem = {
                    data: icalData.value,
                    filename: 'Cal_' + eventData.uid + '.ics'
                };

                yield this.davClient.createCalendarObject(this.activeCalendar, calItem);
            } catch (e) {
                throw e;
            }
        }.bind(this));
    }


}
