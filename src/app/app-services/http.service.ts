import {Injectable} from '@angular/core';
import 'rxjs/add/operator/share';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';
import {Constants} from '../constants';
import {Subject} from 'rxjs/Subject';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class HttpService {

    private accessTokken: string;
    private headers;
    private api = Constants.API_URL;
    private sendAuthMsg;
    private logoutNotification = new Subject();

    constructor(private http: HttpClient,
                private toastr: ToastsManager) {
        this.sendAuthMsg = true;
    }

    setTokken(value) {
        this.accessTokken = value;
    }

    onLogout() {
        return this.logoutNotification.asObservable();
    }

    createHeader() {

        if (this.accessTokken) {
            this.headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessTokken
            });
        } else {
            this.headers = new HttpHeaders({
                'Content-Type': 'application/json',
            });
        }
    }

    sendUnAuthorizedMessage(message) {
        message = message || 'You need to login first.';
        this.sendAuthMsg = false;
        this.toastr.error(message, null, {showCloseButton: true});
        setTimeout(() => {
            this.sendAuthMsg = true;
        }, 5000);
        this.logoutNotification.next('user_logout');
    }

    mapResponse(resp, returnHeaders = false) {
        if (returnHeaders === false) {
            return resp.body;
        } else {
            return {
                body: resp.body,
                headers: resp.headers
            };
        }
    }

    showError(error, showErrors) {
        switch (error.status) {
            case 401:
                if (showErrors.e401 !== false) {
                    if (this.sendAuthMsg) {
                        const body = error;
                        const errorMsg = body.message || 'You need to login first';
                        this.sendUnAuthorizedMessage(errorMsg);
                    }
                }
                break;
            case 400:
                if (showErrors.e400 !== false) {
                    const body = error;
                    const errorMsg = body.message || 'There seems to be some error.';
                    this.toastr.error(errorMsg, null, {showCloseButton: true});
                }
                break;
            case 500:
                if (showErrors.e500 !== false) {
                    this.toastr.error('We are unable to process your request.', null, {showCloseButton: true});
                }
                break;
            case 404:
                if (showErrors.e404 !== false) {
                    this.toastr.error('API resource does not exist', null, {showCloseButton: true});
                }
                break;
            case 422:
                if (showErrors.e422 !== false) {
                    let errorMsg;
                    const body = error;
                    errorMsg = body.message || 'Unable to process your request.';
                    this.toastr.error(errorMsg, 'Oops!', {showCloseButton: true});
                }
                break;
        }
    }

    post(method, value, showErrors = {}, returnHeaders = false) {

        this.createHeader();
        const url = this.api + method;
        const observable = this.http.post(url, value, {
            headers: this.headers,
            observe: 'response'
        }).map(resp => this.mapResponse(resp, returnHeaders)).share();

        observable.subscribe(
            data => {
            },
            error => {
                this.showError(error, showErrors);
            }
        );

        return observable;
    }

    get(method, value = '', showErrors = {}, returnHeaders = false) {
        this.createHeader();
        const url = this.api + method + value;
        const observable = this.http.get(url, {
            headers: this.headers,
            observe: 'response'
        }).map(resp => this.mapResponse(resp, returnHeaders)).share();

        observable.subscribe(
            data => {
            },
            error => {
                this.showError(error, showErrors);
            }
        );

        return observable;
    }

    delete(method, value = '', showErrors = {}, returnHeaders = false) {
        this.createHeader();
        const url = this.api + method + value;
        const observable = this.http.delete(url, {
            headers: this.headers,
            observe: 'response'
        }).map(resp => this.mapResponse(resp, returnHeaders)).share();


        observable.subscribe(
            data => {
            },
            error => {
                this.showError(error, showErrors);
            }
        );

        return observable;
    }

    put(method, value, showErrors = {}, returnHeaders = false) {
        this.createHeader();
        const url = this.api + method;
        const observable = this.http.put(url, value, {
            headers: this.headers,
            observe: 'response'
        }).map(resp => this.mapResponse(resp, returnHeaders)).share();


        observable.subscribe(
            data => {
            },
            error => {
                this.showError(error, showErrors);
            }
        );

        return observable;
    }
}
