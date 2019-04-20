
var map, infoWindow


var initialPos = {
  lat: -34.398,
  lng: 150.664
}


function updateLocations(){
  var arrayLength = locationsDataArray.length;
  var pos;
  for (var i = 0; i < arrayLength; i++){
    var latData = locationsDataArray[i].latitude;
    var lngData = locationsDataArray[i].longitude;
    var title = locationsDataArray[i].title;
    var content = locationsDataArray[i].content;
    pos = {
      lat: latData,
      lng: lngData
    }
    addMarker(map, locationsDataArray[i]);
    }
    map.setCenter(pos);
    map.setZoom(4);
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: initialPos,
    zoom: 1,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  infoWindow = new google.maps.InfoWindow;
  updateLocations();
}

function addMarker(map, location) {
  //TODO: custom marker images

  pos = {
    lat: location.latitude,
    lng: location.longitude
  }
  var marker = new google.maps.Marker({
    position: pos,
    map: map
    //TODO: add custom icon:
  });
  var contentString = '<div class="info-window" id="clickableItem" >' +
        '<h3>' +location.title + '</h3>' +
        '<div class="info-content">' +
        '<img src=' + location.picture + ' alt="HTML tutorial" style="width:30px;height:30px;border-radius: 50%; padding: 20px, 20px, 20px, 20px;"' +
        '<p>' + location.content + '</p>' +
        '</div>' +
        '</div>';
        var infoWindow = new google.maps.InfoWindow({
          content: contentString,
          maxWidth: 400
        });
        marker.addListener('click', function() {
          infoWindow.open(map, marker);
        });
        //infoWindow.addListener('click', loadViewPage() );

        google.maps.event.addListener(infoWindow, 'domready', function(){
          //now my elements are ready for dom manipulation
          var clickableItem = document.getElementById('clickableItem');
          clickableItem.addEventListener('click', () => {
            loadViewPage(location);
          });
        });


}

function loadViewPage(location){
  localStorage.setItem("currentLocTitle", location.title);
  localStorage.setItem("currentLocContent", location.content);
  localStorage.setItem("currentLocPicture", location.picture);

  window.location = "info.html";
}
