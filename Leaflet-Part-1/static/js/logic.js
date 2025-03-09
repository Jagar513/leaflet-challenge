// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});

// OPTIONAL: Step 2 - Create a second base map for the user to choose from.
let street = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [20, 0], // Centering around the equator
  zoom: 2,
  layers: [basemap]
});

// Function to determine marker color based on earthquake depth.
function getColor(depth) {
  return depth > 90 ? "#FF4500" :
         depth > 70 ? "#FF8C00" :
         depth > 50 ? "#FFA500" :
         depth > 30 ? "#FFD700" :
         depth > 10 ? "#ADFF2F" :
                      "#7CFC00";
}

// Function to determine marker size based on magnitude.
function getRadius(magnitude) {
  return magnitude === 0 ? 1 : magnitude * 4;
}

// Function to style each earthquake marker.
function styleInfo(feature) {
  return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth-based color
      color: "#000",
      radius: getRadius(feature.properties.mag), // Magnitude-based size
      stroke: true,
      weight: 0.5
  };
}

// Create a layer group for earthquakes.
let earthquakes = new L.layerGroup();

// Fetch earthquake data from USGS.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function(feature, layer) {
          layer.bindPopup(
              `<strong>Location:</strong> ${feature.properties.place} <br>
              <strong>Magnitude:</strong> ${feature.properties.mag} <br>
              <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
          );
      }
  }).addTo(earthquakes);

  earthquakes.addTo(map);
});

// Create the legend control.
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");
  let depths = [-10, 10, 30, 50, 70, 90];
  let colors = ["#7CFC00", "#ADFF2F", "#FFD700", "#FFA500", "#FF8C00", "#FF4500"];
  
  for (let i = 0; i < depths.length; i++) {
      div.innerHTML += `<i style="background: ${colors[i]}; width: 15px; height: 15px; display: inline-block;"></i>
                        ${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+"}`;
  }
  return div;
};
legend.addTo(map);

// OPTIONAL: Step 2 - Adding Tectonic Plate Data
let tectonicPlates = new L.layerGroup();
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plate_data) {
  L.geoJson(plate_data, {
      color: "orange",
      weight: 2
  }).addTo(tectonicPlates);
});

// Define baseMaps and overlayMaps for layer control.
let baseMaps = {
  "Basic Map": basemap,
  "Street Map": street
};

let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add layer control to the map.
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);