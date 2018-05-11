import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Geolocation} from "@ionic-native/geolocation";

declare var google;

/**
 * Generated class for the DirectionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-directions',
    templateUrl: 'directions.html',
})
export class DirectionsPage {
    @ViewChild('map') mapElement: ElementRef;
    map: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public geolocation: Geolocation) {
        // Maps implementation: https://www.joshmorony.com/ionic-2-how-to-use-google-maps-geolocation-video-tutorial/
    }

    ionViewDidEnter() {
        this.loadMap();
    }

    loadMap() {
        this.geolocation.getCurrentPosition().then((position) => {
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            let mapOptions = {
                center: latLng,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        }, (err) => console.log(err));
    }

    addMarker() {
        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: this.map.getCenter()
        });
        let content = "<h4>Information!</h4>";

        this.addInfoWindow(marker, content);
    }

    addInfoWindow(marker, content) {
        let infoWindow = new google.maps.InfoWindow({
            content: content
        });
        google.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
        });
    }
}
