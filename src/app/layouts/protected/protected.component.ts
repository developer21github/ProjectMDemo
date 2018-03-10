import {Component, OnInit} from '@angular/core';
import {Constants} from '../../constants';
import {Router} from '@angular/router';
import {PermissionsService} from '../../users/permissions.service';
import {UserService} from '../../users/user.service';
import {HeaderComponent} from './header/header.component';

@Component({
    selector: 'app-protected',
    templateUrl: './protected.component.pug',
    styleUrls: ['./protected.component.less']
})
export class ProtectedComponent implements OnInit {
    currentYear;
    userPopup = false;
    dashboardURL = Constants.APP_URLS.dashboard;
    menuPermission = {
        adminDashboard: false,
        managementDashboard: false,
        projects: false,
        users: false
    };

    constructor(private permissionsService: PermissionsService,
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
