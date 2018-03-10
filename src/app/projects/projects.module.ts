import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {RoutesModule} from '../routes/routes.module';
import {UsersModule} from '../users/users.module';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule as CalendarModulePrimeng} from 'primeng/calendar';
import {CalendarModule} from '../calendar/calendar.module';
import {AutoCompleteModule} from 'primeng/autocomplete';


import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ProjectsComponent} from '../projects/projects.component';
import {ProjectsManageComponent} from '../projects/projects.manage.component';
import {ProjectsService} from './projects.service';
import {KanbanModule} from '../kanban/kanban.module';
import {SharedModule} from '../shared/shared.module';
import {HelperService} from '../app-services/helper.service';

@NgModule({
    imports: [
        CommonModule,
        RoutesModule,
        UsersModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        AutoCompleteModule,
        CalendarModule,
        KanbanModule,
        SharedModule,
        CalendarModulePrimeng
    ],
    providers: [
        ProjectsService,
        HelperService
    ],
    declarations: [ProjectsComponent, ProjectsManageComponent]
})
export class ProjectsModule {
}
