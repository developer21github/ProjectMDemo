import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RoutesModule} from '../routes/routes.module';
import {UsersModule} from '../users/users.module';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule as CalendarModulePrimeng} from 'primeng/calendar';
import {CalendarModule} from '../calendar/calendar.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CompaniesComponent} from '../companies/companies.component';
import {CompaniesManageComponent} from '../companies/companies.manage.component';
import {CompaniesService} from './companies.service';
import {SharedModule} from '../shared/shared.module';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {HelperService} from '../app-services/helper.service';
import {BsModalRef} from 'ngx-bootstrap';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {PaginatorModule} from 'primeng/paginator';

@NgModule({
    imports: [
        CommonModule,
        RoutesModule,
        InfiniteScrollModule,
        UsersModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        ConfirmDialogModule,
        InputTextModule,
        CalendarModulePrimeng,
        PaginatorModule,
        SharedModule,
        AutoCompleteModule,
        CalendarModule
    ],
    providers: [
        CompaniesService,
        HelperService,
        BsModalRef,
        ConfirmationService
    ],
    declarations: [CompaniesComponent, CompaniesManageComponent]
})
export class CompaniesModule {
}
