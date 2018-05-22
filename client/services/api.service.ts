import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Place} from '../classes/place';

@Injectable()
export class ApiService {

    constructor(private http: HttpClient) {
    }

    addLocationToUser(place: Place) {
        console.log(place)
    }
}
