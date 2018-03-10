import {Injectable} from '@angular/core';
import {HttpService} from '../app-services/http.service';
import {LocalStoreService} from '../app-services/local-store.service';
import {ToastsManager} from 'ng2-toastr';
import {Constants} from '../constants';

@Injectable()
export class PermissionsService {

    public user_role;
    private PERMISSIONS = 'api-user-role/permissions/';
    private permissions = {};

    constructor(private http: HttpService,
                private localStoreService: LocalStoreService,
                private toaster: ToastsManager,
                private localStore: LocalStoreService) {
        this.getPermissionsToLocalstore();
    }

    setUserRole(user_role) {
        this.user_role = user_role;
    }

    savePermissionsToLocalstore() {
        this.localStore.set('permissions', JSON.stringify(this.permissions));
    }

    getPermissionsToLocalstore() {
        try {
            this.permissions = JSON.parse(this.localStore.get('permissions'));
        } catch (e) {
            // invalid JSON, lets ignore
        }
    }

    getUserPermissions() {
        const showErrors = {
            e401: false,
        };
        this.http.get(this.PERMISSIONS, this.user_role, showErrors).subscribe(permissions => {
            this.parsePermissions(permissions);
        }, error => {
            this.toaster.error('We are facing technical difficulties, please contact administrator.');
        });
    }

    parsePermissions(permissionsData) {
        permissionsData.forEach(permission => {
            this.permissions[permission.permission] = {};
            Object.keys(Constants.RIGHTS).forEach(right => {
                this.permissions[permission.permission][Constants.RIGHTS[right]] = permission[Constants.RIGHTS[right]] || 0;
            });
        });

        this.setGenericPermissions();
    }

    setGenericPermissions() {
        let dashboardGenericPermissions = [];
        let projectsGenericPermissions = [];

        dashboardGenericPermissions = Object.keys(this.permissions).filter(item => item.indexOf(Constants.PERMISSIONS._Dashboard) > -1);
        projectsGenericPermissions = Object.keys(this.permissions).filter(item => item.indexOf(Constants.PERMISSIONS._Projects) > -1);

        this.permissions[Constants.PERMISSIONS._Dashboard] = {};
        this.permissions[Constants.PERMISSIONS._Projects] = {};
        Object.keys(Constants.RIGHTS).forEach(right => {

            dashboardGenericPermissions.some(item => {
                this.permissions[Constants.PERMISSIONS._Dashboard][Constants.RIGHTS[right]] = this.permissions[item][Constants.RIGHTS[right]];
                if (this.permissions[Constants.PERMISSIONS._Dashboard][Constants.RIGHTS[right]]) {
                    return true;
                }
            });

            projectsGenericPermissions.some(item => {
                this.permissions[Constants.PERMISSIONS._Projects][Constants.RIGHTS[right]] = this.permissions[item][Constants.RIGHTS[right]];
                if (this.permissions[Constants.PERMISSIONS._Projects][Constants.RIGHTS[right]]) {
                    return true;
                }
            });
        });

        this.savePermissionsToLocalstore();
    }

    can(permission, access) {
        return this.permissions[permission] && this.permissions[permission][access];
    }

    showAdminMenu() {
        return true;
        // return this.user_role && this.can(Constants.PERMISSIONS.AdminDashboard, Constants.RIGHTS.Read);
    }

    showManagementMenu() {
        return true;
        // return this.user_role && this.can(Constants.PERMISSIONS._Dashboard, Constants.RIGHTS.Read);
    }

    showProjectsMenu() {
        return true;
        // return this.user_role && this.can(Constants.PERMISSIONS._Projects, Constants.RIGHTS.Read);
    }

    showUsersMenu() {
        return true;
        // return this.user_role && this.can(Constants.PERMISSIONS.AdminDashboard, Constants.RIGHTS.Read);
    }
}
