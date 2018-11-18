var map;
var infoWindow;
var ViewModel;

//Listing of places in Barcelona
var locationsBarcelona = [
	{title: 'Parc Güell', location: {lat: 41.413611, lng:  2.152778}, content: 'test'},
	{title: 'Parc de la Ciutadella', location: {lat: 41.388056, lng: 2.1875}, content: ''},
	{title: 'La Barceloneta', location: {lat: 41.379889, lng: 2.189361}, content: ''},
	{title: 'Plaça de Catalunya', location: {lat: 41.386667, lng: 2.17}, content: ''},
	{title: 'Temple Expiatori del Sagrat Cor', location: {lat: 41.422075, lng: 2.118861}, content: ''}
];

var markers = [];

//Creates a new map - center and zoom are required
function initMap() {
	Barcelona = {lat: 41.383333, lng: 2.183333};
	map = new google.maps.Map(document.getElementById('map'), {
		center: Barcelona,
		zoom: 12,
		gestureHandling: 'cooperative',
		styles: styles
});

var infoWindow = new google.maps.InfoWindow();
var bounds = new google.maps.LatLngBounds();

//The following group uses the location array to create an array of markers
  for (var i = 0; i < locationsBarcelona.length; i++) {
	//Get the position from the location array
	var position = locationsBarcelona[i].location;
	var title = locationsBarcelona[i].title;
	var content = locationsBarcelona[i].content;

	//Create a marker per location, and put into markers array.
	var marker = new google.maps.Marker({
		map: map,
		position: position,
		title: title,
		content: content,
		animation: google.maps.Animation.DROP,
		id: i
	});
	//Push the marker to our array of markers.
    markers.push(marker);
	ViewModel.myLocations()[i].marker = marker;

	//Create an onclick event to open an infowindow at each markers.
	marker.addListener('click', function() {
		populateInfoWindow(this, infoWindow);
		infoWindow.setContent('');
	});
	bounds.extend(markers[i].position);
  }
    map.fitBounds(bounds);
 }
 
//This function populates the infoWindow when marker is clicked
function populateInfoWindow(marker, infoWindow) { 
	var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    
    var wikiRequestTimeout = setTimeout(function(){
		infoWindow.setContent("failed to get wikipedia resources");
	}, 8000);

	$.ajax({
		url: wikiUrl,
		dataType: "jsonp",
		success: function(data) {
			console.log(data);

			var artUrl = data[3][0];
			var artExtract = data[2][0];

			if (artUrl == undefined) {
				infoWindow.setContent('no wiki content match');
				infoWindow.open(map, marker);

			}else{
				infoWindow.marker = marker;
				infoWindow.setContent('<h4>'+marker.title+'</h4>'+'<p>'+ artExtract+'</p>'+'<a href="'+artUrl+'">'+artUrl+'</a>');
                infoWindow.open(map, marker);
			};
		    clearTimeout(wikiRequestTimeout);
		}
	})
}

	
var Location = function(data){
  var self = this;
  this.title = data.title;
  this.location = data.location;
  this.show = ko.observable(true);
};

var ViewModel = function() {
	var self = this;
	this.myLocations = ko.observableArray();
	this.filterString = ko.observable("");

	for (j = 0; j < locationsBarcelona.length; j++) {
    	var place = new Location(locationsBarcelona[j]);
   		self.myLocations.push(place);
  }
  this.searchFilter = ko.computed(function() {
    var filter = self.filterString().toLowerCase();
    for (i = 0; i < self.myLocations().length; i++) {
      if (self.myLocations()[i].title.toLowerCase().indexOf(filter) > -1){
        self.myLocations()[i].show(true);
        if (self.myLocations()[i].marker) {
          self.myLocations()[i].marker.setVisible(true); // shows/filters map markers according to match with user key words
        }
      } else {
        self.myLocations()[i].show(false); // hides locations according to match with user key words
        if (self.myLocations()[i].marker) {
          self.myLocations()[i].marker.setVisible(false); // hides map markers according to match with user key words
        }
      }
    }
  });
  
  this.showLocation = function(locations) {
    google.maps.event.trigger(locations.marker, "click");
  };
  this.mapError = function(){
  	alert("Google maps failed to load.  Please check your internet connection or try again to load.")
  }
};

ViewModel = new ViewModel();

ko.applyBindings(ViewModel);