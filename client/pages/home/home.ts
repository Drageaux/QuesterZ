import {Component, ElementRef, ViewChild} from "@angular/core";
import {NavController} from "ionic-angular";
import {DirectionsPage} from "../directions/directions";
import {Geolocation} from "@ionic-native/geolocation";

declare var google;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    directionsPage = DirectionsPage;

    @ViewChild('map') mapElement: ElementRef;
    myLatLng: any = null;
    map: any;
    placesService: any;
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    infoWindow = new google.maps.InfoWindow();

    constructor(public navCtrl: NavController,
                public geolocation: Geolocation) {
    }

    ionViewDidEnter() {
        this.geolocation
            .getCurrentPosition()
            .then((position) => {
                this.myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                let mapOptions = {
                    center: this.myLatLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

                // bind services to map
                this.directionsDisplay.setMap(this.map);
                this.placesService = new google.maps.places.PlacesService(this.map);

                this.placesService.nearbySearch({
                    location: this.myLatLng,
                    radius: '500',
                    type: ['restaurant']
                }, (results, status) => {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        for (let i = 0; i < results.length; i++) {
                            let place = results[i];
                            this.createMarker(place);
                        }
                    }
                })
            }, (err) => console.log(err));
    }

    createMarker(place) {
        let marker = new google.maps.Marker({
            map: this.map,
            position: place.geometry.location,
            icon: {
                url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
                anchor: new google.maps.Point(10, 10),
                scaledSize: new google.maps.Size(10, 17)
            }
        });

        google.maps.event.addListener(marker, 'click', () => {
            let request = {placeId: place.place_id};
            this.placesService.getDetails(request, (result, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error(status);
                    return;
                }
                this.infoWindow.setContent(result.name);
                this.infoWindow.open(this.map, marker);
            });
        });
    }

    calcRoute(place){
        let request = {
            origin: this.myLatLng,
            destination: place.geometry.location,
            // Note that Javascript allows us to access the constant
            // using square brackets and a string value as its
            // "property."
            travelMode: google.maps.TravelMode['WALKING']
        };
        this.directionsService.route(request, (response, status) => {
            if (status == 'OK') {
                this.directionsDisplay.setDirections(response);
            }
        });
    }

    pushPageDirections() {
        this.navCtrl.push(this.directionsPage);
    }
}

