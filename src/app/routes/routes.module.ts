import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AppGuard} from './app.guard';

import {PublicComponent} from '../layouts/public/public.component';
import {ProtectedComponent} from '../layouts/protected/protected.component';
import {LoginComponent} from '../users/login/login.component';
import {ForgotComponent} from '../users/forgot/forgot.component';
import {NewPasswordComponent} from '../users/new-password/new-password.component';
import {CompaniesComponent} from '../companies/companies.component';
import {CompaniesManageComponent} from '../companies/companies.manage.component';
import {MainWrapperComponent} from '../calendar/main-wrapper/main-wrapper.component';
import {ProjectsComponent} from '../projects/projects.component';
import {ProjectsManageComponent} from '../projects/projects.manage.component';
import {PendingChangesGuard} from './pending.changes.guard';

const routes: Routes = [
    {
        path: '',
        canActivate: [AppGuard],
        data: {roles: ['admin']},
        component: ProtectedComponent,
        children: [
            {
                path: '',
                component: ProjectsComponent
            },
            {
                path: 'company',
                component: CompaniesComponent,
            },
            {
                path: 'manage-company',
                canDeactivate: [PendingChangesGuard],
                component: CompaniesManageComponent,
            },
            {
                path: 'edit-company/:id',
                canDeactivate: [PendingChangesGuard],
                component: CompaniesManageComponent,
            },
            {
                path: 'calendar',
                component: MainWrapperComponent,
            },
            {
                path: 'project',
                component: ProjectsComponent,
            },
            {
                path: 'manage-project',
                canDeactivate: [PendingChangesGuard],
                component: ProjectsManageComponent
            },
            {
                path: 'edit-project/:id',
                canDeactivate: [PendingChangesGuard],
                component: ProjectsManageComponent
            }
        ]
    },
    {
        path: 'login',
        component: PublicComponent,
        children: [
            {
                path: '',
                component: LoginComponent,
            },
            {
                path: 'forgot',
                component: ForgotComponent,
            },
            {
                path: 'set-password/:email/:token',
                component: NewPasswordComponent,
            }
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ],
    declarations: [],
    providers: [
        AppGuard,
        PendingChangesGuard
    ]
})
export class RoutesModule {
}
