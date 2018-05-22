import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ApiService {

    constructor(private http: HttpClient) {
    }

    addLocationToUser(latitude: number, longitude: number){
        console.log(latitude, longitude)
    }
}
