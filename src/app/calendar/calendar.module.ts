import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CalendarModule as CalendarModulePrimeng} from 'primeng/calendar';
import {ScheduleModule} from 'primeng/schedule';
import {AutoCompleteModule} from 'primeng/autocomplete';

import {MainWrapperComponent} from './main-wrapper/main-wrapper.component';
import {CalendarService} from './calendar.service';
import {CalendarComponent} from './calendar/calendar.component';
import {ActivityFormComponent} from './activity-form/activity-form.component';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {CompaniesService} from '../companies/companies.service';
import {ActivityTimelineComponent} from './timeline/activity.timeline.component';

@NgModule({
    imports: [
        CommonModule,
        ScheduleModule,
        CalendarModulePrimeng,
        FormsModule,
        SharedModule,
        AutoCompleteModule
    ],
    declarations: [MainWrapperComponent, CalendarComponent, ActivityFormComponent, ActivityTimelineComponent],
    entryComponents: [ActivityFormComponent],
    exports: [ActivityTimelineComponent],
    providers: [CalendarService, CompaniesService]
})
export class CalendarModule {

}
