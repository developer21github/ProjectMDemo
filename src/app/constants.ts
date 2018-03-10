let env = 'local';
let API_URL;
let DAVURL;

const APP_URLS = {
    login: '/login',
    dashboard: '/project',
    calendar: '/calendar',
    forgetPassword: '/login/forgot',
    newPassword: '/login/set-password',
    company: '/company',
    manageCompany: '/manage-company',
    editCompany: '/edit-company',
    editProject: '/edit-project',
    project: '/project',
    manageProject: '/manage-project'
};
const PERMISSIONS = {
    /** Admin Dashboard */
    AdminDashboard: 'AdminDashboard',

    /** Users Dashboard */
    UserDashboard: 'UserDashboard',

    /** Management Dashboard */
    Dashboard_UsersLogins: 'Dashboard_UsersLogins',
    Dashboard_UsersLoginsReport: 'Dashboard_UsersLoginsReport',
    Dashboard_ManagersLogins: 'Dashboard_ManagersLogins',
    Dashboard_ManagersLoginsReport: 'Dashboard_ManagersLoginsReport',
    Dashboard_Projects: 'Dashboard_Projects',
    Dashboard_ProjectsReports: 'Dashboard_ProjectsReports',
    _Dashboard: 'Dashboard_', // generic permission for dashboard access

    /** Projects */
    Projects_All: 'Projects_All',
    Projects_Own: 'Projects_Own',
    _Projects: 'Projects_' // generic permission for projects access
};
const RIGHTS = {
    Create: 'create',
    Read: 'read',
    Update: 'update',
    Delete: 'delete'
};


if (window.location.hostname.indexOf('protek.constructionaptitude.co.uk') === 0) {
    env = 'prod';
} else {
    env = 'stage';
}

if (env === 'prod') {
    API_URL = 'https://protek-api.constructionaptitude.co.uk';
    DAVURL = 'https://protek-sabre.constructionaptitude.co.uk/calendarserver.php/principals/';
} else {
    API_URL = 'https://da-api.drywallaptitude.co.uk';
    DAVURL = 'https://da-sabre.drywallaptitude.co.uk/principals/'; // will update when available
}

export class Constants {
    public static get API_URL(): string {
        return API_URL;
    }

    public static get DAVURL(): string {
        return DAVURL;
    }

    public static get APP_URLS(): any {
        return APP_URLS;
    }

    public static get PERMISSIONS(): any {
        return PERMISSIONS;
    }

    public static get RIGHTS(): any {
        return RIGHTS;
    }
}
