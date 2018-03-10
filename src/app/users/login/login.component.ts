import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';

import {UserService} from '../user.service';
import {Constants} from '../../constants';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.pug',
    styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

    title = 'User Login | Knauf Specification Author';
    APP_URLS = Constants.APP_URLS;
    loginData = {
        username: '',
        password: ''
    };
    loading = false;
    showLoader = false;
    returnUrl;

    constructor(private titleService: Title,
                private  router: Router,
                private route: ActivatedRoute,
                private user: UserService,
                private toaster: ToastsManager) {
        // this.titleService.setTitle(this.title);
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.APP_URLS.dashboard;
        this.tryAutoLogin();
    }

    validateLoginForm() {
        if (!this.loginData.username) {
            return false;
        }

        if (!this.loginData.password) {
            return false;
        }

        return true;
    }

    login() {
        if (!this.validateLoginForm()) {
            this.toaster.error('Email address and/or password missing.');
            return;
        }
        this.loading = true;
        this.user.login(this.loginData.username, this.loginData.password).subscribe(data => {
            this.loading = false;
            this.toaster.success('Login Successful!');
            this.router.navigate([this.returnUrl]);
        }, error => {
            if (error.message.indexOf('security requirements') > -1 && error.token) {
                this.router.navigate([this.APP_URLS.newPassword + '/' + error.token + '/' + this.user.PASSWORD_STRENGTH]);
            }
            this.loading = false;
        });
    }

    tryAutoLogin() {
        this.showLoader = true;
        this.user.tryAutoLogin().subscribe(data => {
            this.showLoader = false;
            this.router.navigate([this.returnUrl]);
        }, err => {
            this.showLoader = false;
        });
    }
}
