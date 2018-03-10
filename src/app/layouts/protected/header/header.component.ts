import {Component, OnInit, DoCheck} from '@angular/core';
import {Constants} from '../../../constants';
import {Router} from '@angular/router';
import {PermissionsService} from '../../../users/permissions.service';
import {UserService} from '../../../users/user.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.pug',
    styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
    dashboardURL = Constants.APP_URLS.dashboard;
    companyURL = Constants.APP_URLS.company;
    calendarURL = Constants.APP_URLS.calendar;
    projectURL = Constants.APP_URLS.project;
    currentYear;
    userPopup = false;

    menuPermission = {
        adminDashboard: false,
        managementDashboard: false,
        projects: false,
        users: false
    };

    constructor(public permissionsService: PermissionsService,
                private user: UserService,
                private router: Router) {
    }

    ngOnInit() {
        this.currentYear = new Date().getFullYear();
    }

    toggleUserPopup(event) {
        event.stopPropagation();
        this.userPopup = !this.userPopup;
    }

    hideUserPopup() {
        this.userPopup = false;
    }

    logout() {
        this.user.logout().subscribe(data => {
            this.router.navigate([Constants.APP_URLS.login]);
        });
    }

}
