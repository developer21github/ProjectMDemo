import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {UserService} from '../users/user.service';
import {Constants} from '../constants';

@Injectable()
export class AppGuard implements CanActivate {
    constructor(private router: Router,
                public activatedRoute: ActivatedRoute,
                private userService: UserService) {
        // nothing in constructor
    }

    canActivate(next: ActivatedRouteSnapshot,
                state: RouterStateSnapshot) {
        // const roles = next.data['roles']; // would be used later
        // const user: any = {}; // would be used later
        // specify route protection logic below
        if (this.userService.isAuthenticated()) {
            // logged in so return true
            return true;
        } else {
            this.router.navigate([Constants.APP_URLS.login], { queryParams: { returnUrl: state.url }});
            // not logged in so redirect to login page with the return url
            return false;
        }
    }
}
