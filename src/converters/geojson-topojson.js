/*
TopoJSON is an extension of GeoJSON that encodes topology.
Rather than representing geometries discretely, geometries in TopoJSON files
are stitched together from shared line segments called arcs. TopoJSON eliminates
redundancy, offering much more compact representations of geometry than with
GeoJSON; typical TopoJSON files are 80% smaller than their GeoJSON equivalents.
In addition, TopoJSON facilitates applications that use topology,
such as topology-preserving shape simplification, automatic map coloring,
and cartograms.
*/
var topojson = require("topojson");
var es = require('event-stream');
var combine = require('stream-combiner');
var geojsonStream = require('geojson-stream');

exports.inputTypes = ['application/vnd.geo+json'];
exports.outputTypes = ['application/vnd.topo+json'];

exports.createStream = function() {
  // There is an open issue about streaming for this library: https://github.com/mbostock/topojson/issues/80

  // var bufferToString = es.map(function(data, callback) {
  //   callback(null, data.toString());
  // });
  // return combine([bufferToString, geojsonStream.parse('*'), csv.stringify()]);

  //
  // var collection = {type: "FeatureCollection", features: […]}; // GeoJSON
  // var topology = topojson.topology({collection: collection},{
  //   'property-transform': function propertyTransform(feature) {
  //     return feature.properties;
  //   }
  // }); // convert to TopoJSON
  // console.log(topology.objects.collection); // inspect TopoJSON
};
