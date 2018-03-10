import {Component, OnDestroy, OnInit} from '@angular/core';
import {Constants} from '../constants';
import {ProjectsService} from './projects.service';
import {Router} from '@angular/router';
import {HelperService} from '../app-services/helper.service';


@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.pug',
    styleUrls: ['./projects.component.less']
})
export class ProjectsComponent implements OnInit, OnDestroy {

    APP_URLS = Constants.APP_URLS;
    public projects = [];
    public stages = [];
    public count = 0;
    public syncing = false;
    private projectPollingId = null;
    private projectPollingInverval = 30;

    constructor(private projectService: ProjectsService, private router: Router, private helper: HelperService) {
    }

    ngOnInit() {
        this.projectService.getAllStages().subscribe(
            (items) => {
                this.stages = items.filter(item => item.active);
                this.count += 1;
            }
        );
        this.getProjects();
        this.projectPollingId = setInterval(this.getProjects.bind(this), this.projectPollingInverval * 1000);

    }

    ngOnDestroy() {
        clearInterval(this.projectPollingId);
    }

    getProjects() {
        if (this.count >= 2) {
            this.syncing = true;
        }
        this.projectService.getProjects([this.projectService.models.companies]).subscribe(
            (item) => {
                this.projects = item.map(project => {
                    project.value = this.helper.formatCurrency(project.value);
                    return project;
                });

                this.count += 1;
                this.syncing = false;
            }
        );
    }

    kanbanStateUpdated(projectData) {
        const project = JSON.parse(JSON.stringify(projectData));
        project.value = this.helper.currencyToInterger(project.value);
        this.projectService.updateProjects(project).subscribe(
            (data) => {
                // KANBAN UPDATED SUCCESSFULLY
            }
        );
    }

    projectClicked(e) {
        this.router.navigate([Constants.APP_URLS.editProject, e]);
    }

}
