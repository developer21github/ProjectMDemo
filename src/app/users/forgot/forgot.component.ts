import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {ToastsManager} from 'ng2-toastr';
import {Constants} from '../../constants';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.pug',
    styleUrls: ['./forgot.component.less']
})
export class ForgotComponent implements OnInit {

    title = 'Recover Password | Knauf Specification Author';
    APP_URLS = Constants.APP_URLS;
    userEmail = '';
    loading = false;

    constructor(private titleService: Title,
                private  router: Router,
                private user: UserService,
                private toaster: ToastsManager) {
        // this.titleService.setTitle(this.title);
    }

    ngOnInit() {
    }

    forgot() {
        if (!this.userEmail) {
            this.toaster.error('Please provide your email address');
            return;
        }
        this.loading = true;
        this.user.sendPassword(this.userEmail).subscribe((data: any) => {
            const message = data.message || 'An email has been sent to <b>' + this.userEmail + '</b> with further instructions.';
            this.toaster.success(message, '', {enableHTML: true});
            this.loading = false;
        }, err => {
            this.loading = false;
        });

    }
}
