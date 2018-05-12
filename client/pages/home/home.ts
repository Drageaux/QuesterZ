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
    @ViewChild('myAddress') addressInputElement: ElementRef;
    myLatLng: any = null;
    map: any;
    placesService: any;
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    markers: any[] = [];
    infoWindow = new google.maps.InfoWindow();
    infoContent = '';

    constructor(public navCtrl: NavController,
                public geolocation: Geolocation) {
    }

    ionViewDidEnter() {
        this.loadMap();
    }


    /****************************
     * GOOGLE MAPS API HANDLERS *
     ****************************/
    loadMap() {
        this.geolocation
            .getCurrentPosition()
            .then((position) => {
                this.myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                let mapOptions = {
                    center: this.myLatLng,
                    zoom: 20,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
                // bind services to map
                this.directionsDisplay.setMap(this.map);
                this.placesService = new google.maps.places.PlacesService(this.map);

                // add SearchBox
                let searchBox = new google.maps.places.SearchBox(this.addressInputElement);
                this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.addressInputElement);
                // bias the SearchBox results towards current map's viewport
                this.map.addListener('bounds_changed', () => {
                    searchBox.setBounds(this.map.getBounds());
                });

                searchBox.addListener('places_changed', () => {
                    this.searchNearbyPlaces(searchBox);

                    // clear old markers
                    this.markers.forEach(function (marker) {
                        marker.setMap(null);
                    });
                    this.markers = [];
                });

                // search with geolocation first
                this.searchNearbyPlaces(searchBox);


            }, (err) => console.log(err));
    }

    searchNearbyPlaces(searchBox: any): void {
        if (searchBox) {
            // search with searchBox's address
            let places = searchBox.getPlaces();
            for (let i = 0; i < 5; i++) { // stop at 5 requests for now
                let place = places[i];
                this.createMarker(place);
            }
        } else {
            // search with geolocation
            this.placesService.nearbySearch({
                location: this.myLatLng,
                radius: '500',
                type: ['restaurant']
            }, (results, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (let i = 0; i < 5; i++) { // stop at 5 requests for now
                        let place = results[i];
                        this.createMarker(place);
                    }
                }
            });
        }
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

                this.infoContent = ` 
                    <h4>` + result.name + `</h4>
                    <p>` + result.adr_address + `</p><br>
                `;
                this.infoWindow.setContent(this.infoContent);
                this.infoWindow.open(this.map, marker);
            });
            this.calcRoute(place);
        });
    }

    calcRoute(place) {
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


    changeMyAddress(addr: string) {

    }


    /**************
     * NAVIGATION *
     **************/
    pushPageDirections() {
        this.navCtrl.push(this.directionsPage);
    }
}

