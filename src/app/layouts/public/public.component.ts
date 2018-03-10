import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-public',
    templateUrl: './public.component.pug',
    styleUrls: ['./public.component.less']
})
export class PublicComponent implements OnInit {


    constructor(private router: Router) {
    }

    ngOnInit() {

    }

}
