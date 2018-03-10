import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {LocalStoreService} from '../app-services/local-store.service';
import {LoginComponent} from './login/login.component';

import {UserService} from './user.service';
import {ForgotComponent} from './forgot/forgot.component';
import {NewPasswordComponent} from './new-password/new-password.component';
import {PermissionsService} from './permissions.service';
import {SharedModule} from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SharedModule
    ],
    providers: [
        UserService,
        PermissionsService,
        LocalStoreService
    ],
    declarations: [LoginComponent, ForgotComponent, NewPasswordComponent]
})
export class UsersModule {}
