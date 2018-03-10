import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2} from '@angular/core';

@Component({
    selector: 'app-column',
    templateUrl: './column.component.pug',
    styleUrls: ['./column.component.less']
})
export class ColumnComponent implements OnInit {

    @Input() column;
    @Input() projects = [];
    @Output() projectsUpdated = new EventEmitter();
    @Output() projectsClicked = new EventEmitter();
    public removeEventsClass = false;
    private ignoreLeaveEvent = false;

    constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.renderer.listen(this.elementRef.nativeElement, 'dragenter', (evt) => {
            this.addDummy(evt);

            this.removeEventsClass = true;
            this.ignoreLeaveEvent = true;
            setTimeout(() => {
                this.ignoreLeaveEvent = false;
            }, 0);
        });

        this.renderer.listen(this.elementRef.nativeElement, 'dragover', (evt) => {
            if (evt.preventDefault) {
                evt.preventDefault();
            }
        });

        this.renderer.listen(this.elementRef.nativeElement, 'dragleave', (evt) => {
            if (!this.ignoreLeaveEvent) {
                this.removeEventsClass = false;
                this.removeDummy(evt);
            }
        });

        this.renderer.listen(this.elementRef.nativeElement, 'drop', (evt) => {
            this.removeEventsClass = false;
            this.removeDummy(evt);
            const id = evt.dataTransfer.getData('id');
            if (id) {
                const title = evt.dataTransfer.getData('title');
                const obj = {
                    'project_id': id,
                    'title': title,
                    'to_stage_id': this.column.id
                };
                this.projectsUpdated.emit(obj);
            }
        });
    }

    cardClicked(id) {
        this.projectsClicked.emit(id);
    }


    addDummy(evt) {
        const title = localStorage.getItem('dragTitle');
        const column = localStorage.getItem('dragColumn');
        let shouldAddDummy = true;
        this.projects.forEach(project => {
            if (Object.keys(project).indexOf('dummy') !== -1) {
                shouldAddDummy = false;
            }
        });

        if (shouldAddDummy && this.column.id !== parseInt(column, 10)) {
            const obj = {
                'name': title,
                'dummy': true
            };
            this.projects.push(obj);
        }


        this.projects.sort((e1, e2) => {
            if (e1.name.toLowerCase() > e2.name.toLowerCase()) {
                return 1;
            } else {
                return 0;
            }
        });
    }


    removeDummy(evt) {
        let index = -1;
        this.projects.forEach((project, ind) => {
            if (Object.keys(project).indexOf('dummy') !== -1) {
                index = ind;
            }
        });
        if (index !== -1) {
            this.projects.splice(index, 1);
        }
    }
}
