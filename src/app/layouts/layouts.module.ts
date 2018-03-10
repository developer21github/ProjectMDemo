import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RoutesModule} from '../routes/routes.module';
import {UsersModule} from '../users/users.module';

import {PublicComponent} from './public/public.component';
import {ProtectedComponent} from './protected/protected.component';
import { HeaderComponent } from './protected/header/header.component';
import {CalendarModule} from '../calendar/calendar.module';

@NgModule({
    imports: [
        CommonModule,
        RoutesModule,
        UsersModule,
        CalendarModule
    ],
    declarations: [PublicComponent, ProtectedComponent, HeaderComponent]
})
export class LayoutsModule {
}
