//user access code from Mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoic2pzdG9yeW1hcCIsImEiOiJjbDFmbW9kdDYwMDZlM2lyMmttdWR2OGs3In0.5Roc_Q0q5dBc-HdWCed3zg';
var geojsonData;
var shownLayer = [];
var indexListing;
var popUps;



var filterGroup = document.getElementById('filter-group');
var hashtagLabels = document.createElement('div');
hashtagLabels.id = "hashtag-labels";
//coordinates for San José
var sanjose = [-121.8863, 37.3382];
//create new map
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sjstorymap/ckoj67pd4132g17p5drie5i5a', //current color scheme
  zoom: 10,
  center: sanjose
});


// Store local geojson file into a variable
$(document).ready(function() {

  $.getJSON('data/sj-storymap-no-winners.geojson', function(results) {
    // Assign the results to the geojsonData variable
    geojsonData = results;
    //for testing
    // console.log(results);
    //assign each artist to an ID
    geojsonData.features.forEach(function(artist, i) {
      artist.properties.id = i;
      //for testing
      // console.log("artistid=" + artist.properties.id);
    });
  });
});
// This will let the .remove() function work later on **come back
//waits for the map to load for other functions to work
map.on('load', function() {
  //loads the custom markers

  map.addControl(new mapboxgl.NavigationControl(), 'top-left');
  map.loadImage(
    'media/sjstory-map-marker-2.png',
    function(error, image) {

      if (error) throw error;

      // Add the image to the map style.
      map.addImage('custom-marker', image);

    }
  );

  // Add a data source containing one point feature.
  map.addSource('sj-story-data', {
    'type': 'geojson',
    'data': geojsonData
  });
  // adds the geojson file as a source into the map


  buildLocationList(geojsonData);

  // Creates larger image with black backdrop when clicked on
  var modal = document.getElementById("myModal");

  // Get the image and insert it inside the modal
  var img = document.getElementsByClassName("artist-img");
  var modalImg = document.getElementById("img01");
  for (var i = 0; i < img.length; i++) {
    img[i].onclick = function() {
      modal.style.display = "block";
      modalImg.src = this.src;
    }
  }

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // sets up a layer, 0 is the first layer
  indexListing = 0;

  //adds hashtag popup header
  var filterHeader = document.createElement('H1');
  var headerText = document.createTextNode("HASHTAGS");
  filterHeader.appendChild(headerText);
  filterHeader.id = 'hashtag-header-text';
  filterGroup.appendChild(filterHeader);

  var hashtagClickedOnce = false;
  var currentClickedLayerID = "";


  //grabs all artist data in the geoJSON file and stores them into "feature"
  geojsonData.features.forEach(function(feature) {
    var symbol;
    var originalHash;
    //checks if artist/writer chose a hashtag and leaves it blank if none has been chosen
    if (!feature.properties['hashtag']) {
      symbol = "";
      originalHash = "";
    } else {
      originalHash = feature.properties['hashtag'];
      symbol = originalHash;
      if (symbol.includes('#')) {
        symbol = symbol.replace('#', '');
      }
      //checks if user has more than one hashtag, choose the first one
      if (symbol.includes(',')) {
        var firstHash = symbol.substring(0, symbol.indexOf(","));
        // console.log("first hash: " + firstHash);
        symbol = firstHash;
      }

    }
    console.log("symbol: " + symbol + "\nfor artist: " + feature.properties['first name']);
    //sets layerID to the new hashtag name
    var layerID = 'poi-' + symbol;
    // console.log(layerID);
    //array is made so that each layer interacts with other functions
    shownLayer[indexListing] = layerID;
    indexListing++;


    //creates a layer for each hashtag/filter
    if (!map.getLayer(layerID)) {
      map.addLayer({
        'id': layerID,
        'type': 'symbol',
        'source': 'sj-story-data',
        'layout': {
          'icon-image': 'custom-marker',
          'icon-size': 0.15,
          'icon-allow-overlap': true,
          'text-allow-overlap': true,
          // 'text-ignore-placement': true,
          'icon-ignore-placement': true,
          // get the title name from the source's "title" property
          'text-field': ['get', 'title'],
          'text-font': [
            'Open Sans Semibold',
            'Arial Unicode MS Bold'
          ],
          'text-offset': [0, 1.25],
          'text-anchor': 'top'
        },
        'filter': ['==', 'hashtag', originalHash]
        //**come back with issue
      });

      // Add checkbox and label elements for the layer.
      var input = document.createElement('input');

      input.type = 'checkbox';
      input.id = layerID;
      input.checked = false;
      hashtagLabels.appendChild(input);

      var label = document.createElement('label');
      label.setAttribute('for', layerID);
      label.textContent = symbol;
      hashtagLabels.appendChild(label);
      filterGroup.appendChild(hashtagLabels);

      // When the checkbox changes, update the visibility of the layer.
      // On first click, show just one and uncheck all other hashtag layers.

      //if it is clicked and hashtagClickedOnce is False
      //then change the visibility of all other HASHTAGS
      //else stay normal
      input.addEventListener('change', function(e) {
        currentClickedLayerID = layerID;
        // console.log("Current layer id is: " + currentClickedLayerID + "and target is: " + e.target.id);
        if (popUps) {
          if (popUps[0]) popUps[0].remove();
        }

        map.zoomTo(8.6, {
          duration: 2000,
          pitch: 0,
          center: sanjose
        });

        if (hashtagClickedOnce == false) {
          for (i = 0; i < shownLayer.length; i++) {
            if (currentClickedLayerID != shownLayer[i]) {
              console.log("shownlayercycle at: " + shownLayer[i]);
              map.setLayoutProperty(
                shownLayer[i],
                'visibility',
                'none'
              );

            } else {
              map.setLayoutProperty(
                shownLayer[i],
                'visibility',
                e.target.checked ? 'visible' : 'none'
              );

            }
          }
          hashtagClickedOnce = true;
          console.log("hashtag clicked is: " + hashtagClickedOnce);
        } else {
          map.setLayoutProperty(
            layerID,
            'visibility',
            e.target.checked ? 'visible' : 'none'
          );
        }
        // else {
        //   map.setLayoutProperty(
        //     layerID,
        //     'visibility',
        //     e.target.checked ? 'visible' : 'none'
        //   );
        // }

        // map.setLayoutProperty(
        //   layerID,
        //   'visibility',
        //   e.target.checked ? 'visible' : 'none'
        // );

      });
    }

  });
  // for testing
  // console.log(indexListing);
});

if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}




//current location button
// map.addControl(
//   new mapboxgl.GeolocateControl({
//     positionOptions: {
//       enableHighAccuracy: true
//     },
//     trackUserLocation: true
//   })
// );
//for hashtag menu to open upon click
function hashtagMenu() {
  var x = document.getElementById("hashtag-labels");
  if (window.getComputedStyle(x).display === "block") {
    document.getElementById("hashtag-labels").style.display = "none";
    // console.log('filter group will be hidden');
  } else if (window.getComputedStyle(x).display === "none") {
    document.getElementById("hashtag-labels").style.display = "block";
  }
}
// builds the sidebar with geoJSON data
function buildLocationList(data) {
  data.features.forEach(function(artist, i) {

    var prop = artist.properties;
    prop.id = i;

    //for testing
    // console.log(prop);

    // Add a new listing section to the sidebar.
    var listings = document.getElementById('listings');
    var listing = listings.appendChild(document.createElement('div'));
    // Assign a unique `id` to the listing.
    listing.id = "listing-" + prop.id;
    // Assign the `item` class to each listing for styling.
    listing.className = 'item';

    // Add the link to the individual listing created above.
    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.id = "link-" + prop.id;
    //using the title of the piece as header
    link.innerHTML = '<div><h1 id="' + link.id + '-h1">' + prop['first name'] +
      " " + prop['last name'] + '</h1></div>';

    if (prop["category"] == "poetic") {

      link.innerHTML += "<h5 class = 'category'>Poetic Postcard Participant<h5>"



    } else if (prop["category"] == "wish") {

      link.innerHTML += "<h5 class = 'category'>Wish You Were Here Participant<h5>"


    } else if (prop["category"] == "storymap") {
      if (prop["storymap winner"] == "TRUE") {
        link.innerHTML += "<h5 class = 'winner' id ='storymap-winner'>San José Story Map Winner<h5>"
      } else {
        // link.innerHTML += "<h5 class = 'category'>San José Story Map<h5>"
      }

    }

    link.innerHTML += prop["title of work"];

    // if (prop["poetic winner"]=="TRUE" || prop["wish winner"]=="TRUE" || prop["storymap winner"]=="TRUE")
    // {
    //   document.getElementById(link.id).style.backgroundColor = "#ddb05a";
    //   document.getElementById(link.id).style.padding = "10px";
    //   document.getElementById(link.id+"-h1").style.color = "#000000";
    // }







    //user the artist and description
    var details = listing.appendChild(document.createElement('div'));


    if (prop["photo submission"]) {
      // https://drive.google.com/uc?export=view&id=
      //https://drive.google.com/file/d/ID/preview


      //get around for google drive links
      var currentLink = prop["photo submission"];
      // console.log("current link: " + currentLink);
      //grabs the id of the media

      // finds the last index of the term in the string instead of the first
      String.prototype.indexOfEnd = function(string) {
        var io = this.indexOf(string);
        return io == -1 ? -1 : io + string.length;
      }


      var newLink = currentLink.substring(currentLink.indexOfEnd('id='), currentLink.length);
      // console.log("new link: " + newLink);

      if (prop["photo submission 2"]) {
        var currentLink2 = prop["photo submission 2"];
        var newLink2 = currentLink2.substring(currentLink2.indexOfEnd('id='), currentLink2.length);

        details.innerHTML += "<br />" + "<img class ='artist-img' src='" + "https://drive.google.com/uc?id=" + newLink +
          "'/><div id='myModal' class='modal'><span class = 'close'>X</span><img class='modal-content' id='img01'><div id ='caption'></div></div>" + "<br />" + "<img class ='artist-img' src='" + "https://drive.google.com/uc?id=" + newLink2 +
          "'/><div id='myModal' class='modal'><span class = 'close'>X</span><img class='modal-content' id='img01'><div id ='caption'></div></div>";

      } else {
        details.innerHTML += "<br />" + "<img class ='artist-img' src='" + "https://drive.google.com/uc?id=" + newLink +
          "'/><div id='myModal' class='modal'><span class = 'close'>X</span><img class='modal-content' id='img01'><div id ='caption'></div></div>";
      }

    }

    if (prop["video submission"]) {

      //get around for google drive links
      var currentLink = prop["video submission"];
      // console.log("current link: " + currentLink);
      var newLink = currentLink.substring(currentLink.lastIndexOf('id='), currentLink.length);
      // console.log("new link: " + newLink);
      details.innerHTML += "<br />" + "<iframe src='" + "https://drive.google.com/uc?export=view&" + newLink + "' width = '600px' webkitallowfullscreen mozallowfullscreen allowfullscreen autoplay='0'> </iframe>"
    }

    if (prop["text submission"]) {

      var newText = prop["text submission"];
      var resText = newText.replace(/\n/g, '<br />');
      // console.log(resText);
      details.innerHTML += "<br />" + resText + "<br />"
    }

    if (prop["url submission"]) {
      details.innerHTML += "<br /><a id ='url-sub' href='" + prop["url submission"] + "' target='_blank'> Link to submission</a><br />"
    }



    // details.innerHTML += "<br />" + prop.statement + "<br />"


    //Listen to the element and when it is clicked, do four things:
    //1. Update the `currentFeature` to the store associated with the clicked link
    //2. Fly to the point
    //3. Close all other popups and display popup for clicked store
    //4. Highlight listing in sidebar (and remove highlight for all other listings)

    link.addEventListener('click', function(e) {
      for (var i = 0; i < data.features.length; i++) {
        if (this.id === "link-" + data.features[i].properties.id) {
          var clickedListing = data.features[i];

          flyToPin(clickedListing);
          createPopUp(clickedListing);
        }
      }
      //updates the active item
      var activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');
    });

    // On every scroll event, check which element is on screen
    listings.onscroll = function() {
      var visibleListing;
      var visibleListingID;
      for (var i = 0; i < data.features.length; i++) {
        checkListingLink = "link-" + i;
        visibleListingID = "listing-" + i;
        if (isElementOnScreen(checkListingLink) && data.features[i].geometry.coordinates[1]) {
          visibleListing = data.features[i];
          //for testing
          // console.log("we are in the onscroll function at index: " + i);
          flyToPin(visibleListing);
          createPopUp(visibleListing);

          //updates the active item with scroll
          var scrolledListing = document.getElementById(visibleListingID);
          var activeItem = document.getElementsByClassName('active');
          if (activeItem[0]) {
            activeItem[0].classList.remove('active');
          }
          scrolledListing.classList.add('active');
        }
      };
    }

    //checks which artist work is being viewed in the scroll bar
    function isElementOnScreen(id) {
      var element = document.getElementById(id);
      //for testing
      // console.log(element + " is on screen");
      var bounds = element.getBoundingClientRect();
      //for testing
      // console.log("bounds top: " + bounds.top + " Window inner height:" + window.innerHeight + " Bounds bottom: " + bounds.bottom);
      if (window.innerWidth < 600) {
        return bounds.top < window.innerHeight - (window.innerHeight / 2);
      } else {
        return bounds.top < window.innerHeight - (window.innerHeight / 3);
      }


      // return bounds.top < window.innerHeight && bounds.bottom > 0;
    };
  });
}



map.on('zoom', () => {
  updateTilt();
})


//This updates the tilt of the map when at different zoom points
function updateTilt() {
  var currentZoom = map.getZoom();
  var currentPitch = map.getPitch();
  var newPitch;


  if (map.scrollZoom.isActive()) {

    if (currentZoom > 12) {
      newPitch = 45;
      if (newPitch != currentPitch) {
        map.setPitch(45);
        //for testing
        // console.log(currentZoom);
        // console.log(currentPitch);
      }
    }

    if (currentZoom <= 11) {
      newPitch = 0;
      if (newPitch != currentPitch) {
        map.setPitch(0);
        // map.easeTo({
        //   pitch: 0,
        //   duration: 3000,
        //   essential: true
        // });
        //for testing
        // console.log(currentZoom);
        // console.log(currentPitch);
      }
    }

  }
}

//allows the map to move depending on click/scroll
function flyToPin(currentFeature) {
  var latitude = currentFeature.geometry.coordinates[1];
  var longitude = currentFeature.geometry.coordinates[0];
  map.flyTo({
    center: [longitude, latitude + .006],
    zoom: 13.5,
    speed: 0.5, // make the flying slow
    curve: 1, // change the speed at which it zooms out
    // bearing: 27,
    pitch: 45,
    essential: true
  });
}

//creates popup over the location icon
function createPopUp(currentFeature) {
  popUps = document.getElementsByClassName('mapboxgl-popup');
  var coorPad = currentFeature.geometry.coordinates;
  var popupContent = "";


  popupContent = '<h3>' + currentFeature.properties['title of work'] +
    '</h3>' + '<div id="artist-name">' +
    currentFeature.properties['first name'] +
    " " + currentFeature.properties['last name'] + '</div>';

  // if (currentFeature.properties['bio url']) {
  //   popupContent += "<a id='artist-bio' href='" +
  //     "artist-bio.html#" + currentFeature.properties['first name'] + currentFeature.properties['last name'] + "' target= 'blank'>" + "Artist Bio" + "</a>" + " - ";
  // }

  if (currentFeature.properties['personal url']) {
    popupContent += "<a id='artist-portfolio' href='" +
      currentFeature.properties['personal url'] + "' target= 'blank'>" + "Portfolio" + "</a>";
  }

  popupContent += '<p>' + currentFeature.properties['statement'] + '</p>';

  //for testing
  // console.log("long and lat: " + coorPad);
  //removes another pop up if there is already one open
  if (popUps[0]) popUps[0].remove();
  var popup = new mapboxgl.Popup({
      closeOnClick: true
    })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(popupContent)
    .addTo(map);
}

map.on('click', function(e) {
  /* Determine if a feature in the "locations" layer exists at that point. */
  // forloop is in consideration of the added hashtag symbol layers
  for (var i = 0; i < indexListing; i++) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: [shownLayer[i]]
    });
    /* If yes, then: */
    if (features.length) {

      var clickedPoint = features[0];

      // Fly to the point
      flyToPin(clickedPoint);

      //Close all other popups and display popup for clicked store
      createPopUp(clickedPoint);
      // Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      var listing = document.getElementById('listing-' + clickedPoint.properties.id);
      listing.classList.add('active');
      listing.scrollIntoView();
    }

  }

});
