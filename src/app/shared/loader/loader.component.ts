import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.less']
})
export class LoaderComponent implements OnInit {

    @Input() width: number;

    constructor() {

    }

    ngOnInit() {
        if (this.width == undefined) {
            this.width = 150;
        }
    }

}