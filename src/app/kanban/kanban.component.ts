import {Component, DoCheck, EventEmitter, Input, KeyValueDiffers, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';

@Component({
    selector: 'app-kanban',
    templateUrl: './kanban.component.pug',
    styleUrls: ['./kanban.component.less']
})
export class KanbanComponent implements OnInit, DoCheck, OnDestroy {

    @Input() projects = [];
    @Input() columns = [];
    @Output() projectsUpdated = new EventEmitter();
    @Output() projClicked = new EventEmitter();
    @ViewChild('kanbanContainer') kanbanContainer;
    public columnProjects = [];
    lockScroll = (e) => {
        const col = e.target.closest('.kanban-column-content');
        if (col) {
            const scrollActive = Math.abs(col.scrollHeight - col.offsetHeight) > 3;
            const allowTopScroll = col.scrollTop === 0 && e.deltaY < 0;
            const allowBottomScroll = (Math.abs(col.scrollTop - (col.scrollHeight - col.offsetHeight)) < 1 && e.deltaY > -0);
            if (scrollActive && (allowTopScroll || allowBottomScroll)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

    };
    private bindedLockScroll = this.lockScroll.bind(this);
    private objDiffer;

    constructor(private differs: KeyValueDiffers, private renderer: Renderer2) {
        this.objDiffer = {};
        this.projects.forEach((elt) => {
            this.objDiffer[elt.id] = this.differs.find(elt).create();
        });
    }

    ngOnInit() {
        window.addEventListener('wheel', this.bindedLockScroll);
        window.addEventListener('mousewheel', this.bindedLockScroll);
        window.addEventListener('touchmove', this.bindedLockScroll);
    }

    ngOnDestroy() {
        window.removeEventListener('wheel', this.bindedLockScroll);
        window.removeEventListener('mousewheel', this.bindedLockScroll);
        window.removeEventListener('touchmove', this.bindedLockScroll);
    }

    needUpdate() {
        const projectNeedsUpdate = this.projects.some((project) => {
            const objDiffer = this.objDiffer[project.id];
            if (!objDiffer) {
                this.objDiffer[project.id] = this.differs.find(project).create();
                return project;
            }
            const objChanges = objDiffer.diff(project);
            if (objChanges) {
                return project;
            }
        });
        return projectNeedsUpdate ? true : false;
    }


    ngDoCheck() {
        if (this.needUpdate()) {
            console.log('checked');
            this.columns.forEach(col => {
                this.columnProjects[col.id] = [];
            });
            this.projects.forEach((item) => {
                if (typeof this.columnProjects[item.stage_id] === 'undefined') {
                    this.columnProjects[item.stage_id] = [];
                }
                this.columnProjects[item.stage_id].push(item);
            });

            this.columnProjects.forEach(projects => {
                projects.sort((e1, e2) => {
                    if (e1.name.toLowerCase() > e2.name.toLowerCase()) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            });

        }
    }


    kanbanUpdated(e) {

        let project;
        this.projects.forEach((item) => {
            if (item.id === parseInt(e.project_id, 10)) {
                console.log(item);
                item.stage_id = e.to_stage_id;
                console.log(item);
                project = item;
            }
        });
        this.projectsUpdated.emit(project);
    }

    projectClicked(e) {
        this.projClicked.emit(e);
    }
}
