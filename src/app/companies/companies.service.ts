import {Injectable} from '@angular/core';
import {HttpService} from '../app-services/http.service';
import {Observable} from 'rxjs/Observable';
import {DatePipe} from '@angular/common';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class CompaniesService {


    public filters = {
        byName: 'filter[name]',
        byId: 'filter[id]',
        firstLetter: 'filter[first-letter]'
    };

    private companies;
    private activeFilter = [];
    private perPage = 10;
    // endpoints
    private addCompany = '/companies';
    private updateCompany = '/companies';
    private deleteCompany = '/companies/';
    private getAllCompany = '/companies?expand=owner&';// need to refactor later, to allow dynamic expands.
    private getContactsWithFilterURL = '/company-contacts?';
    private addContact = '/company-contacts';
    private getAllCompanyType = '/company-types';
    private getCompanyTypeById = '/company-types/';
    private getAllContactbyCompanyId = '/company-contacts?filter[company_id]';
    private deleteCompanyContact = '/company-contacts/';

    constructor(private http: HttpService) {

    }

    addCompanies(data): Observable<any> {
        const errors = {
            e422: false
        };
        const promise = this.http.post(this.addCompany, data, errors);
        return promise;
    }

    updateCompanies(data): Observable<any> {
        const errors = {
            e422: false
        };
        const promise = this.http.put(this.updateCompany + '/' + data.id, data, errors);
        return promise;
    }

    reset() {
        this.activeFilter = [];
        this.companies = [];
    }

    setActiveFilter(key, value) {
        const found = this.activeFilter.filter(filter => {
            return filter.key === key;
        });

        if (found.length > 0) {
            found[0].value = value;
        } else {
            this.activeFilter.push({
                key,
                value
            });
        }
        ;
    }

    getAllCompanies(keepFilters = false, page): Observable<any> {
        if (!keepFilters) {
            this.reset();
        }
        let URL = this.getAllCompany;
        URL += 'page=' + page + '&';
        URL += 'per-page=' + this.perPage + '&';

        if (this.activeFilter && this.activeFilter.length > 0) {
            this.activeFilter.forEach(filter => {
                URL += filter.key + '=' + filter.value + '&';
            });
        }

        const promise = new Subject();

        this.http.get(URL, '', '', true).subscribe(data => {
            // needs to implement cache here, later obviously
            this.companies = data;
            promise.next(this.companies);
            promise.complete();
        });

        return promise.asObservable();
    }

    deleteCompanies(id): Observable<any> {
        const showErrors = {
            e401: true
        };
        const promise = this.http.delete(this.deleteCompany, id, showErrors);
        promise.subscribe(data => {
            return data;
        }, error => {

        });
        return promise;
    }

    addCompaniesContact(contactData): Observable<any> {
        const errors = {
            e422: false
        };
        const promise = this.http.post(this.addContact, contactData, errors);
        return promise;
    }

    updateCompaniesContact(contactPutData): Observable<any> {
        const errors = {
            e422: false
        };
        const promise = this.http.put(this.addContact + '/' + contactPutData.id, contactPutData, errors);
        return promise;
    }

    getAllCompaniesType(): Observable<any> {
        const promise = this.http.get(this.getAllCompanyType);
        return promise;
    }

    getCompaniesTypeById(id): Promise<any> {
        const showErrors = {
            e401: true
        };
        const promise = this.http.get(this.getCompanyTypeById, id).toPromise().then(function (data) {
            return data;
        });
        return promise;
    }

    getAllCompaniesContactbyCompanyId(id): Observable<any> {
        const promise = this.http.get(this.getAllContactbyCompanyId + '=' + id);
        return promise;
    }

    getCompaniesByFirstLetter(char): Observable<any> {
        return this.getCompaniesWithFilter(this.filters.firstLetter, char);
    }

    getCompaniesWithFilter(filter, value): Observable<any> {
        const promise = this.http.get(this.getAllCompany + filter + '=' + value);
        return promise;
    }

    getAllCompnayBySearchName(name): Observable<any> {
        return this.getCompaniesWithFilter(this.filters.byName, name);
    }

    getContactsWithFilter(filter, value): Observable<any> {
        const promise = this.http.get(this.getContactsWithFilterURL + filter + '=' + value);
        promise.subscribe(data => {
            return data;
        });
        return promise;
    }

    deleteCompaniesContact(id) {
        const errors = {
            e422: false
        };
        const promise = this.http.delete(this.deleteCompanyContact, id, errors);
        return promise;
    }
}

