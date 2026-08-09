import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ElementRef, ViewChild, NgZone } from '@angular/core';
  declare var google: any;

declare var google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {

  constructor(private platform: Platform, private zone: NgZone) { }

  ngOnInit() {
  }

  @ViewChild('map') mapElement: ElementRef | undefined;
  public map: any;
  public start: any = "Duoc UC: Sede Melipilla - Serrano, Melipilla, Chile";
  public end: any = "Pomaire";
  public latitude: any;
  public longitude: any;
  public directionsService: any;
  public directionsDisplay: any;
  public autocompleteItems:any;

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.initMap()
    })
  }

  initMap() {
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    let latLng = new google.maps.LatLng(this.latitude, this.longitude);
    let mapOptions = {
      zoom: 5,
      zoomControl: false,
      scaleControl: false,
      mapTypeComtrol: false,
      streetViewControl: false,
      fullscreamControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement!.nativeElement, mapOptions);
    this.directionsDisplay.setMap(this.map);
    this.calculateAndDisplayRoute();
  }

  calculateAndDisplayRoute() {
    this.directionsService.route({
      origin: this.start,
      destination: this.end,
      travelMode: 'DRIVING'
    }, (response: any, status: string) => {
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  updateSearchResults() {
    let GoogleAutocomplete = new google.maps.places.AutocompleteService();
    if (this.end == '') {
      this.autocompleteItems = [];
      return;
    }
    GoogleAutocomplete!.getPlacePredictions({ input: this.end },
      (predictions: any, status: any) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction: any) => {
            this.autocompleteItems!.push(prediction);
          });
        });
      });
  }
  selectSearchResult(item: any) {
    this.end = item.description
    this.autocompleteItems = []
    this.initMap()
  }
}