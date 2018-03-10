import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import 'rxjs/add/operator/share';

@Injectable()
export class InfluencerService {

    private getAllURL = '/influencers';

    constructor(private http: HttpService) {
    }

    getAll() {
        return this.http.get(this.getAllURL).share();
    }

}
