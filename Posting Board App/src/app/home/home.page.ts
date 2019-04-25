import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FirebaseService } from '../services/firebase.service';
import { Location } from '../models/location.model';
import 'rxjs-compat/add/operator/map';
import { Observable } from 'rxjs-compat/Observable';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  public base64Image: string;
  categories: any[] = [
    ["Car Crash", "pink-dot.png"],
    ["Closed", "yellow-dot.png"],
    ["Detour", "orange-dot.png"],
    ["Power Outage", "red-dot.png"],
    ["Speed Trap", "blue-dot.png"]
  ];
  gmarkers = [];
  locationsList$: Observable<Location[]>;
  LocArray = [];
  currentLocArray = [];
  map: any;
  position: any;
  locationKey: any;
  currentLoc: any;
  public locationTitle: string;

  constructor(private router: Router, private geolocation: Geolocation, public actionSheetController: ActionSheetController, public firebaseService: FirebaseService) {
    this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
      return changes.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });
    this.locationsList$.subscribe(locations => {
      this.currentLocArray = locations,
      this.LocArray = locations
    });
  }

  ngOnInit() {
    let mapOptions = {
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullScreenControl: false
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.firebaseService.getLocationsList().valueChanges().subscribe(res => {
      for (let item of res) {
        this.addMarker(item);
        this.position = new google.maps.LatLng(item.latitude, item.longitude);
        this.map.setCenter(this.position);
      }
    });
  }

  onContextChange(ctxt: string): void {
    this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
      return changes.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });
    this.locationsList$.subscribe(locations => {
      this.currentLocArray = locations,
      this.LocArray = locations
    });
  }

  addMarker(location: any) {
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/" + this.categories[location.category][1]
      }
    });
    this.gmarkers.push([marker, location.category]);

    this.addInfoWindow(marker, location);
  }

  assignLocation(loc: Location) {
    this.firebaseService.setCurrentLocation(loc);
    this.currentLoc = loc;
    this.locationKey = loc.key;
    this.locationTitle = loc.title;
    console.log("Assigned location key: " + this.locationKey);
  }

  addInfoWindow(marker, location) {
    let contentString =
      '<div class="info-window" id="clickableItem" >' +
        '<h3>' + location.title + '</h3>' +
        '<p>' + this.categories[location.category][0] + '</p>' +
        '<div class="info-content">' +
          '<img src="' + location.picture + '" style="width:30px;height:30px;border-radius: 50%; padding: 20px, 20px, 20px, 20px;"/>' +
          '<p>' + location.content + '</p>' +
        '</div>' +
      '</div>';

    let infoWindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 400
    });

    google.maps.event.addListener(infoWindow, 'domready', () => {
      var clickableItem = document.getElementById('clickableItem');
      clickableItem.addEventListener('click', () => {
        console.log("clicked on marker");
        this.firebaseService.setCurrentLocation(location);
        this.locationTitle = location.title;
        this.router.navigate(['/list', this.locationTitle]);
      });
    });
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
    google.maps.event.addListener(this.map, 'click', () => {
      infoWindow.close(this.map, marker);
    });
  }

  changeCategories(int: number) {
    var tempArray = [];
    for (let i in this.gmarkers) {
      if (int >= 0 && int != this.gmarkers[i][1]) this.gmarkers[i][0].setVisible(false);
      else {
        this.gmarkers[i][0].setVisible(true);
        tempArray.push(this.LocArray[i]);
      }
    }
    this.firebaseService.setCurrentLocation(tempArray[tempArray.length-1]);

    this.currentLocArray = tempArray;
    var f = document.getElementById('filter');
    f.innerHTML = (int >= 0) ? 'Locations: ' + this.categories[int][0] : 'Locations: Show All';

    this.addLocations();
  }

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filters',
      buttons: [{
        text: 'Show All',
        handler: () => this.changeCategories(-1)
      }, {
        text: 'Car Crash',
        handler: () => this.changeCategories(0)
      }, {
        text: 'Closed',
        handler: () => this.changeCategories(1)
      }, {
        text: 'Detour',
        handler: () => this.changeCategories(2)
      }, {
        text: 'Power Outage',
        handler: () => this.changeCategories(3)
      }, {
        text: 'Speed Trap',
        handler: () => this.changeCategories(4)
      }, {
        text: 'Highest Rated',
        handler: () => this.changeCategories(5)
      }]
    });
    await actionSheet.present();
  }

  addLocations() {
    var tempArray = [];
    for (let i in this.currentLocArray) {
      var segment =
        '<ion-item id="list:' + i + '" style="margin-top: 0px; margin-bottom: 0px;">' +
          this.currentLocArray[i].title +
        '</ion-item>'
      tempArray.push(segment);
    }

    var l = document.getElementById('locations');
    l.innerHTML = tempArray.join('');

    for (let i in this.currentLocArray) {
      var e = document.getElementById('list:' + i);
      e.addEventListener('click', () => {
        this.assignLocation(this.currentLocArray[i]);
        this.router.navigate(['/list', this.locationTitle]);
      });
    }
  }
}