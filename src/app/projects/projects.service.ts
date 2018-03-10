import {Injectable} from '@angular/core';
import {HttpService} from '../app-services/http.service';
import {LocalStoreService} from '../app-services/local-store.service';
import {Observable} from 'rxjs/Observable';
import {DatePipe} from '@angular/common';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ProjectsService {


    public filters = {
        byName: 'filter[name]',
        byId: 'filter[id]'
    };

    public projectCompaniesFilters = {
        byProjectId: 'filter[project_id]',
        byCompanyId: 'filter[company_id]',
        byId: 'filter[id]'
    };

    public models = {
        companies: 'companies',
        riba: 'riba',
        stage: 'stage',
        sector: 'sector'
    };
    // endpoints
    private getProjectsWithFilterURL = '/projects?';
    private getAllProjects = '/projects?per-page=0&';
    private addProject = '/projects';
    private updateProject = '/projects/';
    private getAllRiba = '/ribas';
    private getAllStage = '/stages';
    private getAllSector = '/sectors';
    private getCompanyProject;
    private addCompanyProject = this.getCompanyProject = '/company-projects';
    private deleteCompanyProjectURL = '/company-projects/';
    private getProjectsById = '/projects/';
    private getRibasById = '/ribas/';
    private getSectorsById = '/sectors/';
    private getStagesById = '/stages/';
    private getCompaniesByProjectId = '/company-projects/';
    private getCompaniesById = '/companies/';
    private datePipe = new DatePipe('en-US');
    private allProjects: any = [];

    constructor(private http: HttpService,
                private localStoreService: LocalStoreService) {
        this.http.setTokken(this.localStoreService.get('access_token'));
    }

    /**
     * Add projects
     * @returns {Observable<any>}
     */
    addProjects(postData) {
        const showErrors = {
            e401: true
        };

        postData = this.preUpdateProcessing(postData);
        const promise = this.http.post(this.addProject, postData, showErrors);
        promise.subscribe(data => {
            return data;
        }, error => {
        });
        return promise;
    }

    preUpdateProcessing(data) {
        data.riba_id = (data.riba && typeof data.riba === 'object') ? data.riba.id : data.riba_id;
        if (data.riba_id === '') {
            delete data.riba_id;
        }
        data.stage_id = (data.stage && typeof data.stage === 'object') ? data.stage.id : data.stage_id;
        if (data.stage_id === '') {
            delete data.stage_id;
        }
        data.sector_id = (data.sector && typeof data.sector === 'object') ? data.sector.id : data.sector_id;
        if (data.sector_id === '') {
            delete data.sector_id;
        }
        return data;
    }

    /**
     * Update projects
     * @returns {Observable<any>}
     */
    updateProjects(putData): Observable<any> {
        const showErrors = {
            e401: true
        };
        putData = this.preUpdateProcessing(putData);

        const promise = this.http.put(this.updateProject + putData.id, putData, showErrors);
        promise.subscribe(data => {
            return data;
        }, error => {
        });
        return promise;
    }

    /**
     * Add companies project
     * @returns {Observable<any>}
     */
    addCompaniesProject(projectId, companyId): Observable<any> {
        const postData = {
            project_id: projectId,
            company_id: companyId
        };
        const promise = this.http.post(this.addCompanyProject, postData);
        promise.subscribe(data => {
            return data;
        }, error => {
        });
        return promise;
    }

    deleteCompanyProject(projectId, companyId) {

        const promise = new Subject();
        let URL = this.getCompanyProject + '?';
        URL += this.projectCompaniesFilters.byCompanyId + '=' + companyId + '&';
        URL += this.projectCompaniesFilters.byProjectId + '=' + projectId + '&';
        this.http.get(URL).subscribe(data => {
            console.log(data);
            this.http.delete(this.deleteCompanyProjectURL, data[0].id).subscribe(deleted => {
                promise.next(deleted);
                promise.complete();
            }, err => {
                promise.error(err);
                promise.complete();
            });
        }, err => {
            promise.error(err);
            promise.complete();
        });
        return promise.asObservable();
    }

    /**
     * Get all Riba
     ** @returns {Observable<any>}
     */
    getAllRibaPlan(): Observable<any> {
        const showErrors = {
            e401: true
        };
        const promise = this.http.get(this.getAllRiba);
        promise.subscribe(data => {
            return data;
        }, error => {
        });
        return promise;
    }

    /**
     * Get all Stages
     * @returns {Observable<any>}
     */
    getAllStages(): Observable<any> {
        const showErrors = {
            e401: true
        };
        const promise = this.http.get(this.getAllStage);
        promise.subscribe(data => {
            return data;
        }, error => {
        });
        return promise;
    }

    /**
     * Get all Sectors
     * @returns {Observable<any>}
     */
    getAllSectors(): Observable<any> {
        const showErrors = {
            e401: true
        };
        const promise = this.http.get(this.getAllSector);
        promise.subscribe(data => {
            return data;
        }, error => {
        });
        return promise;
    }

    getProjectsWithFilter(filter, value): Observable<any> {
        const promise = this.http.get(this.getProjectsWithFilterURL + filter + '=' + value);
        promise.subscribe(data => {
            return data;
        });
        return promise;
    }

    getProjects(expandArray): Observable<any> {

        const expand = 'expand=' + expandArray.join(',');
        const promise = this.http.get(this.getAllProjects, expand);
        promise.subscribe(data => {
            this.allProjects = data;
            return data;
        });
        return promise;
    }

    getProjectById(id, expandArray = []): Observable<any> {
        const expand = '?expand=' + expandArray.join(',');
        const promise = this.http.get(this.getProjectsById + id + expand);
        promise.subscribe(data => {
            return data;
        }, error => {
        });
        return promise;
    }

    getRibaById(id): Promise<any> {
        const promise = this.http.get(this.getRibasById, id).toPromise().then(function (data) {
            return data;
        });
        return promise;
    }

    getSectorById(id): Promise<any> {
        const promise = this.http.get(this.getSectorsById, id).toPromise().then(function (data) {
            return data;
        });
        return promise;
    }

    getStageById(id): Promise<any> {
        const promise = this.http.get(this.getStagesById, id).toPromise().then(function (data) {
            return data;
        });
        return promise;
    }

    getCompanyByProjectId(id): Promise<any> {
        const promise = this.http.get(this.getCompaniesByProjectId, id).toPromise().then(function (data) {
            return data;
        });
        return promise;
    }

    getCompanyById(id): Promise<any> {
        const promise = this.http.get(this.getCompaniesById, id).toPromise().then(function (data) {
            return data;
        });
        return promise;
    }
}
