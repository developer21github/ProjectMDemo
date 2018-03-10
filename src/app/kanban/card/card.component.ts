import {Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.pug',
    styleUrls: ['./card.component.less']
})
export class CardComponent implements OnInit {

    @Input() project;
    @Input() index;
    public dragged = false;

    constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.renderer.listen(this.elementRef.nativeElement, 'dragstart', (evt) => {
            this.dragged = true;
            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('id', evt.target.id);
            evt.dataTransfer.setData('title', this.project.name);
            localStorage.setItem('dragTitle', this.project.name);
            localStorage.setItem('dragColumn', this.index);
        });


        this.renderer.listen(this.elementRef.nativeElement, 'dragend', (evt) => {
            this.dragged = false;
        });

    }

}
