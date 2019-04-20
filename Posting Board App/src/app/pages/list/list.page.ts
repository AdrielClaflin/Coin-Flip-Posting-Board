import { Component, OnInit } from '@angular/core';
import { Location } from '../../models/location.model';
import { FirebaseService } from '../../services/firebase.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  public LocationKey: string;
  public location: Location;
  public base64Image: string;
  constructor(private activatedRoute: ActivatedRoute, private geolocation: Geolocation,

  public firebaseService: FirebaseService, private camera: Camera) {
       this.location = this.firebaseService.getCurrentLocation();
  }

  ngOnInit() {
    console.log("Got: " + this.activatedRoute.snapshot.paramMap.get('locationTitle'));
    this.base64Image = this.location.picture;
  }

  editLocation(location: Location) {
    this.firebaseService.editLocation(location);
  }
  deleteLocation(location: Location) {
    this.firebaseService.deleteLocation(location);
  }
  openCamera(){
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }
      this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.location.picture = this.base64Image;
      }, (err) => {
      // Handle error
      });
    }
}
