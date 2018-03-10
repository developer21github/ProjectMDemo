import {Component, HostListener, OnInit} from '@angular/core';
import {SelectItem} from 'primeng/api';
import {Constants} from '../constants';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../users/user.service';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProjectsService} from './projects.service';
import {CompaniesService} from '../companies/companies.service';
import {HelperService} from '../app-services/helper.service';
import 'rxjs/add/observable/forkJoin';
import {ComponentCanDeactivate} from '../routes/pending.changes.guard';
import {Observable} from 'rxjs/Observable';
import {BsModalService} from 'ngx-bootstrap';
import {CompaniesManageComponent} from '../companies/companies.manage.component';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.manage.component.pug',
    styleUrls: ['./projects.component.less']
})

export class ProjectsManageComponent implements OnInit, ComponentCanDeactivate {

    APP_URLS = Constants.APP_URLS;
    loading = false;
    showChangedAlert = false;
    formSubmitted = false;
    editData = false;
    ribaType: SelectItem[];
    stageType: SelectItem[];
    sectorType: SelectItem[];
    allCompanies: SelectItem[];
    id: number;
    companies = [];
    projectData = {
        id: '',
        name: '',
        created: '',
        revised: '',
        latest_revision: '',
        riba_id: '',
        riba: null,
        location: '',
        street: '',
        building_no: '',
        city: '',
        country: '',
        postcode: '',
        stage_id: '',
        stage: null,
        sector_id: '',
        sector: null,
        number: '',
        responsible_office: '',
        office_postcode: '',
        value: '',
        edv: '',
        efv: '',
        companies: [],
        order_at: '',
        next_action_at: '',
    };
    public activityModal;
    validation = {
        name: false,
        location: false,
        sector: false,
        order_at: false,
        next_action_at: false,
        companies: false,
    };
    private sub: any;

    constructor(private user: UserService,
                private route: ActivatedRoute,
                private routing: Router,
                private toaster: ToastsManager,
                private formBuilder: FormBuilder,
                private projectsService: ProjectsService,
                private companiesService: CompaniesService,
                private modalService: BsModalService,
                private helper: HelperService) {

        let date = new Date();
        date = new Date(date.valueOf() + date.getTimezoneOffset() * 60000); // converting to GMT 0
        this.projectData.created = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.showChangedAlert) {
            return false;
        }
        return true;
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id'];
            if (!isNaN(this.id)) {
                this.editData = true;
                this.getProjectById();
            }
        });
        this.getAllRiba();
        this.getAllSector();
        this.getAllStage();
    }

    somethingChanged() {
        this.validate();
        this.showChangedAlert = true;
    }

    dateFieldChanged(slug) {
        const date = new Date(this.projectData[slug]);
        this.projectData[slug] = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        this.somethingChanged();
    }

    /**
     * Get by project id
     */
    getProjectById() {
        this.loading = true;

        const expandArr = [
            this.projectsService.models.companies,
            this.projectsService.models.riba,
            this.projectsService.models.sector,
            this.projectsService.models.stage
        ];

        this.projectsService.getProjectById(this.id, expandArr).subscribe(data => {
            this.projectData = data;
            this.companies = this.projectData.companies;
            this.projectData.edv = this.helper.formatCurrency(this.projectData.edv);
            this.projectData.value = this.helper.formatCurrency(this.projectData.value);
            this.loading = false;
        });
    }

    async updateProjectCompanies() {

        const oldCompanies = this.projectData.companies;
        const newCompanies = this.companies;
        const addCompanies = newCompanies.filter(company => {
            return !oldCompanies.some(c => c.id === company.id);
        });

        const delCompanies = oldCompanies.filter(company => {
            return !newCompanies.some(c => c.id === company.id);
        });

        for (let i = 0; i < addCompanies.length; i++) {
            try {
                await this.projectsService.addCompaniesProject(this.projectData.id, addCompanies[i].id).first().toPromise();
            } catch (e) {
                this.toaster.error(e);
            }
        }

        for (let i = 0; i < delCompanies.length; i++) {
            try {
                await this.projectsService.deleteCompanyProject(this.projectData.id, delCompanies[i].id).first().toPromise();
            } catch (e) {
                this.toaster.error(e);
            }
        }
    }

    /**
     * Add Projects
     */

    validate() {
        let valid = true;
        Object.keys(this.validation).forEach((key) => {
            if (!this.projectData[key]) {
                this.validation[key] =   true;
                valid = false;
            } else {
                this.validation[key] =   false;
            }
        });
        if (this.companies.length <= 0) {
            this.validation.companies = true;
            valid = false;
        } else  {
            this.validation.companies = false;
        }
        return valid;
    }

    async addProject() {
        if (!this.validate()) {
            return false;
        }

        try {
            if (new Date(this.projectData.revised).getTime() < new Date(this.projectData.created).getTime()) {
                this.toaster.error('Revised date cannot be less than Creation date!');
                return false;
            }
            if (new Date(this.projectData.next_action_at).getTime() < new Date(this.projectData.created).getTime()) {
                this.toaster.error('Next Action date cannot be less than Creation date!');
                return false;
            }
            let data: any = {};
            const postData = JSON.parse(JSON.stringify(this.projectData));
            postData.edv = this.helper.currencyToInterger(this.projectData.edv);
            postData.value = this.helper.currencyToInterger(this.projectData.value);
            this.loading = true;
            if (this.editData) {
                await this.projectsService.updateProjects(postData).first().toPromise();
                this.toaster.success('Project updated Successful!');
            } else {
                data = await this.projectsService.addProjects(postData).first().toPromise();
                this.toaster.success('Project added Successful!');
                this.projectData.id = data.id;
            }

            await this.updateProjectCompanies();
            this.loading = false;
            this.showChangedAlert = false;
            this.routing.navigate([this.APP_URLS.editProject, this.projectData.id]);
        } catch (e) {
            this.toaster.error(e);
        }
    }

    /**
     * Get all Ribas
     */
    getAllRiba() {
        this.projectsService.getAllRibaPlan().subscribe(data => {
            this.ribaType = data;
        }, error => {
            this.toaster.error('Unable to load Riba data.');
        });
    }

    /**
     * Get all Stages
     */
    getAllStage() {
        this.projectsService.getAllStages().subscribe(data => {
            this.stageType = data;
        }, error => {
            this.toaster.error('Unable to load Stages data.');
        });
    }

    /**
     * Get all sectors
     */
    getAllSector() {
        this.projectsService.getAllSectors().subscribe(data => {
            this.sectorType = data;
        }, error => {
            this.toaster.error('Unable to load Sectors data.');
        });
    }

    searchCompanies($event = null) {
        const searchString = $event ? $event.query : '';
        this.companiesService.getCompaniesWithFilter(this.companiesService.filters.byName, searchString)
            .subscribe(data => {
                this.allCompanies = data;
                if (this.allCompanies.length === 0) {
                    const demo: any = {
                        'id': -1,
                        'name': 'No Company found, Add now?'
                    };
                    this.allCompanies.push(demo);
                }
            });
    }


    projectCompanySelected(e) {
        if (e.id === -1) {
            let companies = [];
            companies = this.companies.filter((company) => {
                return company.id !== -1 ? company : null;
            });
            this.companies = companies;

            const config = {
                class: 'modal-lg',
                initialState: {manageComponentPopup: true}
            };

            this.activityModal = this.modalService.show(CompaniesManageComponent, config);
            this.modalService.onHide.subscribe(data => {
                const company = JSON.parse(data);
                this.companies.push(company);
            }, err => {
                this.toaster.error('Unable to add more companies.');
            });

        }
        this.somethingChanged();
    }

    edvValue(Num) { // function to add commas to textboxes
        return this.projectData.edv = this.helper.formatCurrency(Num);
    }

    ProjectValue(Num) { // function to add commas to textboxes
        return this.projectData.value = this.helper.formatCurrency(Num);
    }
}
