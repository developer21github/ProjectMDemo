import {BrowserModule} from '@angular/platform-browser';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {HttpClientModule} from '@angular/common/http';

import {LayoutsModule} from './layouts/layouts.module';
import {CompaniesModule} from './companies/companies.module';
import {ProjectsModule} from './projects/projects.module';
import {RoutesModule} from './routes/routes.module';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ModalModule} from 'ngx-bootstrap/modal';

import {HttpService} from './app-services/http.service';
import {SessionModalComponent} from './shared/session-modal/session-modal.component';
import {InfluencerService} from './app-services/influencer.service';

@NgModule({
    declarations: [
        AppComponent,
        SessionModalComponent
    ],
    imports: [
        BrowserModule,
        LayoutsModule,
        CompaniesModule,
        ProjectsModule,
        RoutesModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        DropdownModule,
        InputTextModule,
        ToastModule.forRoot(),
        ModalModule.forRoot(),
    ],
    entryComponents: [SessionModalComponent],
    providers: [
        HttpService,
        InfluencerService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
