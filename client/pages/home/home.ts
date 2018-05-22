import {Component, ElementRef, ViewChild} from "@angular/core";
import {NavController} from "ionic-angular";
import {DirectionsPage} from "../directions/directions";
import {Geolocation} from "@ionic-native/geolocation";
import {ApiService} from "../../services/api.service";
import {Place} from "../../classes/place";

declare var google;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    directionsPage = DirectionsPage;

    @ViewChild('map') mapElement: ElementRef;
    myPosition: Place = null;
    map: any;
    placesService: any;
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    markers: any[] = [];
    infoWindow = new google.maps.InfoWindow();
    infoContent = '';

    constructor(public navCtrl: NavController,
                public geolocation: Geolocation,
                private apiService: ApiService) {
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
                this.myPosition = new Place('', '', '', '',
                    new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                let mapOptions = {
                    center: this.myPosition.point,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullScreenControl: false
                };
                this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

                // bind services to map
                this.directionsDisplay.setMap(this.map);
                this.placesService = new google.maps.places.PlacesService(this.map);

                // add SearchBox
                let input = document.getElementById('my-address');
                let searchBox = new google.maps.places.SearchBox(input);
                this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                // bias the SearchBox results towards current map's viewport
                this.map.addListener('bounds_changed', () => {
                    searchBox.setBounds(this.map.getBounds());
                });

                // update my address's latLng on searchBox change
                searchBox.addListener('places_changed', () => {
                    this.updateMyAddress(searchBox);
                });

                // search by geolocation by default
                this.searchNearby();
            }, (err) => console.log(err));
    }

    updateMyAddress(searchBox: any): void {
        if (searchBox) {
            // search with searchBox's address
            let places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }
            let newPlace = places[0];
            this.myPosition = new Place(
                newPlace.id,
                newPlace.name,
                newPlace.formatted_address,
                null,
                new google.maps.LatLng(
                    newPlace.geometry.location.lat(),
                    newPlace.geometry.location.lng()
                )
            );

            // recenter the map
            let bounds = new google.maps.LatLngBounds();
            if (newPlace.geometry.viewport) {
                bounds.union(newPlace.geometry.viewport);
            } else {
                bounds.extend(newPlace.geometry.location);
            }
            this.map.fitBounds(bounds);
            // repopulate markers
            this.searchNearby();
        }
    }

    searchNearby() {
        // clear old markers
        this.markers.forEach((marker) => {
            marker.setMap(null);
        });
        this.markers = [];
        // create a marker for myPosition
        let marker = new google.maps.Marker({
            map: this.map,
            position: this.myPosition.point
        });
        this.markers.push(marker);

        // search with geolocation
        this.placesService.nearbySearch({
            location: this.myPosition.point,
            radius: '500',
            type: ['restaurant']
        }, (results, status) => {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    let place = results[i];
                    this.createMarker(place);
                }
            }
        });
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

        this.markers.push(marker);
    }

    calcRoute(place) {
        let request = {
            origin: this.myPosition.point,
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


    /****************
     * DATA PARSERS *
     ****************/
    registerMyLocation() {
        this.apiService.addLocationToUser(this.myPosition);
    }


    /**************
     * NAVIGATION *
     **************/
    pushPageDirections() {
        this.navCtrl.push(this.directionsPage);
    }
}

