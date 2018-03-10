import {Injectable} from '@angular/core';
import {HttpService} from '../app-services/http.service';
import {LocalStoreService} from '../app-services/local-store.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ToastsManager} from 'ng2-toastr';
import {PermissionsService} from './permissions.service';
import {CalendarService} from '../calendar/calendar.service';
import {Constants} from '../constants';

@Injectable()
export class UserService {

    public id;
    public name;
    public email;
    public role_id;
    public token;
    public token_expire;
    public isLoggedIn = false;
    public companyAllData = [];

    public CHANGE_REQUESTED = 1;
    public PASSWORD_EXPIRED = 2;
    public PASSWORD_STRENGTH = 3;

    public filters = {
        byEmail: 'filter[email]=',
        byName: 'filter[name]=',
        byId: 'filter[id]='
    };

    private passwordValidations = [
        {message: 'be at least 8 characters', rule: /^.{8}/},
        {message: 'be at most 255 characters', rule: /^.{0,255}$/},
        {message: 'contain at least one lowercase letter', rule: /[a-z]/},
        {message: 'contain at least one uppercase letter', rule: /[A-Z]/},
        {message: 'contain at least one number', rule: /[0-9]/}
    ];

    private LOGIN = '/auth/login';
    private VERIFY = '/auth/verify';
    private ALIVE = this.VERIFY;
    private FORGOT = '/auth/reset-password';
    private UPDATE_PASSWORD = '/auth/set-password';
    private LOGOUT = '/auth/logout';
    private GET_USERS = '/users?';

    private password;
    private keepAliveTime = 160;
    private pollingIntervalId;
    private emitSessionDestroyed = new Subject<any>();
    onSessionDestroyed = this.emitSessionDestroyed.asObservable();

    constructor(private http: HttpService,
                private localStoreService: LocalStoreService,
                private toaster: ToastsManager,
                private permissions: PermissionsService,
                private calendarService: CalendarService) {
        this.http.onLogout().subscribe(data => {
            this.token = null;
            this.id = null;
            this.email = null;
            this.name = null;
            this.isLoggedIn = false;
            this.role_id = null;
            this.calendarService.stopSyncInterval();
            this.emitSessionDestroyed.next(data);
        });
    }


    getUsersByFilter(filter, value) {
        return this.http.get(this.GET_USERS + filter + value);
    }

    isAuthenticated($checkFromServer = false) {
        if (this.id) {
            return true;
        }
    }

    validatePassword(password) {
        let valid = true;
        let message = 'Password must ';
        this.passwordValidations.forEach(data => {
            if (data.rule.test(password) === false) {
                valid = false;
                message += data.message + ', ';
            }
        });
        message = message.substr(0, message.length - 2);
        message += '.';

        return {
            valid,
            message
        };
    }

    populate(data) {
        const keys = Object.keys(data);
        keys.forEach(key => {
            this[key] = data[key];
        });
    }

    sendPassword(email) {
        const postData = {
            email
        };
        const showErrors = {
            e422: false
        };
        const promise = this.http.post(this.FORGOT, postData, showErrors);
        promise.subscribe(data => {

        }, error => {
            if (error.email && error.email.length > 0) {
                this.toaster.error(error.email[0]);
            }
        });
        return promise;
    }

    updatePassword(token, email, password) {
        const postData = {
            password,
            email,
            token
        };
        const showErrors = {
            e422: false
        };
        const promise = this.http.post(this.UPDATE_PASSWORD, postData, showErrors);
        promise.subscribe(data => {

        }, error => {
            if (error.password && error.password.length > 0) {
                this.toaster.error(error.password[0]);
            }
        });
        return promise;
    }

    alive() {
        const showErrors = {
            e401: false,
        };
        return this.http.get(this.ALIVE, '', showErrors).subscribe((data: any) => {
            if (data.active === false) {
                this.emitSessionDestroyed.next('Session Destroyed');
                if (this.pollingIntervalId) {
                    clearInterval(this.pollingIntervalId);
                }
            }
        }, er => {
            this.emitSessionDestroyed.next('Session Destroyed');
            if (this.pollingIntervalId) {
                clearInterval(this.pollingIntervalId);
            }
        });
    }

    startAlivePolling() {
        this.pollingIntervalId = setInterval(() => {
            this.alive();
        }, this.keepAliveTime * 1000);
    }

    login(username, password) {
        const postData = {
            username,
            password
        };
        const showErrors = {
            e401: false
        };
        const promise = this.http.post(this.LOGIN, postData, showErrors);
        promise.subscribe((data: any) => {
            this.http.setTokken(data.token);
            this.populate(data.user);
            this.token = data.token;
            this.localStoreService.set('access_token', data.token);
            this.postLoginSteps();
        }, error => {
            this.toaster.error(error.message);
        });

        return promise;
    }

    logout() {
        const data = {
            e401: false
        };
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
        }
        this.permissions.setUserRole(null);
        return this.http.get(this.LOGOUT, '', data);
    }

    tryAutoLogin() {
        return new Observable(observer => {
            const access_token = this.localStoreService.get('access_token');
            if (access_token) {
                const showErrors = {
                    e401: false
                };
                this.http.setTokken(access_token);
                this.http.get(this.VERIFY, '', showErrors).subscribe((data: any) => {
                    if (data.user) {
                        this.token = access_token;
                        this.populate(data.user);
                        observer.next(data.user);
                        observer.complete();
                        this.postLoginSteps();
                    } else {
                        this.localStoreService.remove('access_token');
                        observer.error('Unable to veryfy access_token');
                    }
                }, err => {
                    this.localStoreService.remove('access_token');
                    observer.error('Unable to veryfy access_token');
                });
            } else {
                observer.error('No access_token found');
            }
        });
    }

    postLoginSteps() {
        this.startAlivePolling();
        this.permissions.setUserRole(this.role_id);
        this.isLoggedIn = true;

        this.calendarService.initialize(true,
            this.token,
            Constants.DAVURL + this.email + '/').then(data => {
        }, error => {
            this.toaster.error('Unable to initialize user calendars');
        });
        this.calendarService.setOrganizer(this.name, this.email);
        // this.permissions.getUserPermissions();
    }
}
