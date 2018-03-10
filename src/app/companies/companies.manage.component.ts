import {Component, HostListener, OnInit} from '@angular/core';
import {Constants} from '../constants';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../users/user.service';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';
import {CompaniesService} from './companies.service';
import {ComponentCanDeactivate} from '../routes/pending.changes.guard';
import {Observable} from 'rxjs/Observable';
import {HelperService} from '../app-services/helper.service';
import {Subject} from 'rxjs/Subject';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {InfluencerService} from '../app-services/influencer.service';

@Component({
    selector: 'app-companies',
    templateUrl: './companies.manage.component.pug',
    styleUrls: ['./companies.component.less']
})
export class CompaniesManageComponent implements OnInit, ComponentCanDeactivate {
    APP_URLS = Constants.APP_URLS;
    companyId;
    formSubmitted = false;
    editData = false;
    companyData: any = {};
    savedCompanyData: any = {};
    contacts: any = [];
    initialContacts: any [];
    type = [];
    influences = [];
    owner: any = {};
    users: any = {};
    index: number;
    loading = false;
    companyUpdated = false;
    manageComponentPopup = false;

    constructor(private user: UserService,
                private route: ActivatedRoute,
                private routing: Router,
                private toaster: ToastsManager,
                private modalRef: BsModalRef,
                private modalService: BsModalService,
                private companiesService: CompaniesService,
                private influence: InfluencerService,
                private helper: HelperService) {
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {

        if (this.companyUpdated) {
            this.companyUpdated = false;
            return true;
        }

        if (JSON.stringify(this.companyData) !== JSON.stringify(this.savedCompanyData)) {
            return false;
        }

        if (JSON.stringify(this.contacts) !== JSON.stringify(this.initialContacts)) {
            return false;
        }

        return true;
    }

    searchUsers($event) {
        this.user.getUsersByFilter(this.user.filters.byName, $event.query).subscribe(data => {
            this.users = data;
        });
    }

    async ngOnInit() {
        let params;
        this.loading = true;
        try {
            params = await this.route.params.first().toPromise();
            this.companyId = params['id'];
            if (this.companyId) {
                this.editData = true;
                const data: any = await this.companiesService.getCompaniesWithFilter(this.companiesService.filters.byId, this.companyId).first().toPromise();
                if (data.length === 0) {
                    this.routing.navigate([this.APP_URLS.company]);
                }
                this.companyData = data[0];
            }

            if (this.companyData.owner) {
                this.owner = this.companyData.owner;
            } else {
                this.companyData.owner_id = this.user.id;
                this.owner = this.user;
            }
            await this.getAllCompanyType();
            this.contacts = await this.companiesService.getAllCompaniesContactbyCompanyId(this.companyData.id).first().toPromise();
            this.contacts.forEach((contact) => {
                contact.influencer = {id: contact.influencer_id};
            });
            this.initialContacts = JSON.parse(JSON.stringify(this.contacts));
            this.savedCompanyData = JSON.parse(JSON.stringify(this.companyData));

        } catch (e) {
            this.routing.navigate([this.APP_URLS.company]);
        }
        this.loading = false;
        // get all influences
        this.influence.getAll().subscribe(
            (data: any) => {
                this.influences = data;
            }
        );
    }

    validate() {
        if (!this.companyData.name) {
            return 'Company name is required';
        }

        const invalidContacts = this.contacts.filter(contact => {
            if (!contact.name || !contact.surname || !contact.job_title) {
                return contact;
            }
        });

        if (invalidContacts.length > 0) {
            return 'All contacts must have name, surname and title';
        }

        const invalidContactsEmail = this.contacts.filter(contact => {
            if (contact.email && !this.helper.validateEmail(contact.email)) {
                return contact;
            }
        });

        if (invalidContactsEmail.length > 0) {
            return 'All contacts must have valid email address';
        }


        return '';
    }

    async addCompany() {
        const errors = this.validate();
        if (errors) {
            this.toaster.error(errors);
            return;
        }

        try {
            this.loading = true;
            this.companyData.owner_id = this.owner.id;
            this.companyData.company_type_id = this.companyData.company_type.id;
            let data;
            let message = '';
            if (this.editData) {
                data = await this.companiesService.updateCompanies(this.companyData).first().toPromise();
                message = 'Company updated successfully';
            } else {
                data = await this.companiesService.addCompanies(this.companyData).first().toPromise();
                message = 'Company added successfully';
            }
            await this.updateContacts();
            if (this.manageComponentPopup) {
                // if it was created in popup, then return the data back.
                const temp = await this.companiesService.getCompaniesWithFilter(this.companiesService.filters.byId, data.id).first().toPromise();
                this.modalService.setDismissReason(JSON.stringify(temp[0]));
                this.modalRef.hide();
            }
            this.loading = false;
            this.companyUpdated = true;
            this.toaster.success(message);

            if (!this.manageComponentPopup) {
                this.routing.navigate([this.APP_URLS.company]);
            }
        } catch (e) {
            console.log(e);
            if (Array.isArray(e)) {
                e.forEach(e => {
                    if (e.message) {
                        this.toaster.error(e.message);
                    }
                });
            }
        }
    }

    async updateContacts() {
        const promise = new Subject();

        this.contacts.forEach(
            (contact) => {
                contact.influencer_id = typeof  contact.influencer !== 'undefined' ? contact.influencer.id : null;
            });

        const addContacts = this.contacts.filter(contact => {
            return !this.initialContacts.some(c => c.id === contact.id);
        });

        const delContacts = this.initialContacts.filter(contact => {
            return !this.contacts.some(c => c.id === contact.id);
        });

        const updateContacts = this.contacts.filter(contact => contact.id);

        for (let i = 0; i < addContacts.length; i++) {
            await this.companiesService.addCompaniesContact(addContacts[i]).first().toPromise();
        }

        for (let i = 0; i < delContacts.length; i++) {
            await this.companiesService.deleteCompaniesContact(delContacts[i].id).first().toPromise();
        }

        for (let i = 0; i < updateContacts.length; i++) {
            await this.companiesService.updateCompaniesContact(updateContacts[i]).first().toPromise();
        }

        this.initialContacts = JSON.parse(JSON.stringify(this.contacts));

        setTimeout(() => {
            promise.next('');
            promise.complete();
        }, 0);
        return promise.asObservable();
    }

    addNewContact() {
        this.contacts.push({
            name: '',
            job_title: '',
            surname: '',
            salutation: '',
            email: '',
            mobile: '',
            phone: '',
            id: '',
            company_id: this.companyData.id
        });
    }

    deleteContact(id) {
        this.contacts = this.contacts.filter(c => c.id !== id);
    }

    async getAllCompanyType() {

        try {
            let types = await this.companiesService.getAllCompaniesType().first().toPromise();
            this.type = types;
            const selectedType = this.type.filter(type => type.id === this.companyData.company_type_id);
            this.companyData.company_type = (selectedType.length > 0) ? selectedType[0] : this.type[0];
        } catch (e) {
            this.toaster.error('Unable to load company types');
        }
    }

    exitPopup() {
        this.modalRef.hide();
    }
}
