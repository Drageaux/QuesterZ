import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {DirectionsPage} from "../directions/directions";

declare var google;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    directionsPage = DirectionsPage;

    constructor(public navCtrl: NavController) {

        // Distance Matrix API
        let origin1 = new google.maps.LatLng(55.930385, -3.118425);
        let origin2 = 'Greenwich, England';
        let destinationA = 'Stockholm, Sweden';
        let destinationB = new google.maps.LatLng(50.087692, 14.421150);

        let service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                origins: [origin1, origin2],
                destinations: [destinationA, destinationB],
                travelMode: 'DRIVING',
                // transitOptions: TransitOptions,
                // drivingOptions: DrivingOptions,
                // unitSystem: UnitSystem,
                avoidHighways: true,
                avoidTolls: true
            }, this.callback);
    }

    callback(response, status) {
        // See Parsing the Results for
        // the basics of a callback function.
        console.log(response)
    }

    pushPageDirections() {
        this.navCtrl.push(this.directionsPage);
    }
}

