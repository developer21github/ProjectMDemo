import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

import {UserService} from '../user.service';
import {Constants} from '../../constants';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.pug',
    styleUrls: ['./new-password.component.less']
})
export class NewPasswordComponent implements OnInit, OnDestroy {

    title = 'Recover Password | Knauf Specification Author';
    data = {
        password: '',
        cpassword: ''
    };
    query;
    token;
    APP_URLS = Constants.APP_URLS;
    messages = [];
    reason = 0;
    email;
    showLoader = false;

    constructor(private titleService: Title,
                private route: ActivatedRoute,
                private user: UserService,
                private  router: Router,
                private toaster: ToastsManager) {
        // this.titleService.setTitle(this.title);
        this.messages[this.user.CHANGE_REQUESTED] = '';
        this.messages[this.user.PASSWORD_EXPIRED] = 'Your password has expired and should be changed.';
        this.messages[this.user.PASSWORD_STRENGTH] = 'Your password doesn\'t meet the security requirements and should be changed.';
    }

    ngOnInit() {
        this.query = this.route.params.subscribe(params => {
            this.token = params['token'];
            this.email = params['email'];
        });
    }

    ngOnDestroy() {
        this.query.unsubscribe();
    }

    updatePassword() {
        const validation = this.user.validatePassword(this.data.password);
        if (!validation.valid) {
            this.toaster.error(validation.message);
            return;
        }

        if (this.data.password !== this.data.cpassword) {
            this.toaster.error('Password & confirm password must match');
            return;
        }
        this.showLoader = true;
        this.user.updatePassword(this.token, this.email, this.data.password).subscribe(data => {
            this.showLoader = false;
            this.toaster.success('Password updated successfully');
            this.router.navigate([this.APP_URLS.login]);
        }, err => {
            this.showLoader = false;
        });
    }
}
