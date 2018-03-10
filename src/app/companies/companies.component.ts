import {Component, OnInit} from '@angular/core';
import {Constants} from '../constants';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';
import {UserService} from '../users/user.service';
import {CompaniesService} from './companies.service';
import {ConfirmationService} from 'primeng/api';

@Component({
    selector: 'app-companies',
    templateUrl: './companies.component.pug',
    styleUrls: ['./companies.component.less'],
    providers: [ConfirmationService]
})
export class CompaniesComponent implements OnInit {

    APP_URLS = Constants.APP_URLS;
    public companyDataCount;
    loading = false;
    searchName = '';
    public activeChar = 'All';
    public allowedFilters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    perPage = 0;
    currentPage = 0;
    totalItems = 0;
    companies = [];

    constructor(public user: UserService,
                private toaster: ToastsManager,
                private companiesService: CompaniesService,
                private confirmationService: ConfirmationService) {

    }

    ngOnInit() {
        this.getAllCompany(false, this.currentPage);
    }

    getAllCompany(keepFilters = false, page) {
        this.loading = true;
        this.companiesService.getAllCompanies(keepFilters, page).subscribe(data => {
                this.totalItems = parseInt(data.headers.get('X-Pagination-Total-Count'), 10);
                this.perPage = parseInt(data.headers.get('X-Pagination-Per-Page'), 10);
                this.loading = false;
                this.companies = data.body;
                this.companyDataCount = this.companies.length;
            },
            error => {
                this.loading = false;
                this.toaster.error('Unable to fetch companies.');
            });
    }

    updateFiltersAndGet() {
        this.companiesService.reset();
        const char = this.activeChar !== 'All' ? this.activeChar : '';

        this.companiesService.setActiveFilter(this.companiesService.filters.firstLetter, char);
        this.companiesService.setActiveFilter(this.companiesService.filters.byName, this.searchName);
        this.getAllCompany(true, this.currentPage);
    }

    getAllCompanies() {
        this.activeChar = 'All';
        this.updateFiltersAndGet();
    }

    getCompaniesByFirstLetter(char) {
        this.activeChar = char;
        this.updateFiltersAndGet();
    }

    deleteCompany(id) {
        this.confirmationService.confirm({
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'fa fa-trash',
            accept: () => {
                this.companiesService.deleteCompanies(id).subscribe(() => {
                    this.companies.splice(this.companies.findIndex(e => e.id === id), 1);
                    this.companyDataCount--;
                    this.totalItems--;
                    this.toaster.success('Company deleted Successful!');
                }, error => {
                    this.toaster.error('Unable to delete company');
                });
            }
        });
    }

    changePage(page) {
        this.currentPage = page.page + 1;
        this.getAllCompany(true, page.page + 1);
        return page.page + 1;
    }
}
