import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  loadModules
} from 'esri-loader';
import esri = __esri;

import {
  Color
} from './../../color.model';
import {
  Point
} from './../../point.model';

import {
  PointserviceService
} from './../../pointservice.service';
import {
  AreaInformationService
} from './area-information/area-information.service';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-area',
  templateUrl: './select-area.component.html',
  styleUrls: ['./select-area.component.css']
})

export class SelectAreaComponent implements OnInit, OnDestroy {

  private mapView: esri.MapView;
  private tempGraphicsLayer: esri.GraphicsLayer;
  private sketchViewModel: esri.SketchViewModel;

  private selectedGraphic: esri.Graphic;
  private area: number;
  private areaIndex: string;

  private latitude;
  private longitude;
  private polylineLength;
  private type;
  private forecastSubscription: Subscription;

  private wos = [];

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;
  @ViewChild('streetsLayer') private streetsLayerEl: ElementRef;
  @ViewChild('fire') private fireEl: ElementRef;

  constructor(private pointserviceService: PointserviceService, private areaInformationService: AreaInformationService, private router: Router) {}

  private herokuhost: string = "https://sleepy-brook-85346.herokuapp.com";
  private localhost: string = "localhost:8080";

  ngOnInit() {
    this.initializeMap();
    this.forecastSubscription = this.areaInformationService.forecasts.subscribe( (forecasts) => { 
      if (forecasts && this.latitude && this.longitude && this.wos.length == 0) {
        this.areaInformationService.getWeatherForecastData(this.latitude, this.longitude).subscribe( (data) => {
          //console.log(data);
          if ((<any>data).cod == 200) {
            this.wos = (<any>data).list;
            // this.router.navigate(['']);
          }
        });
      }
      if (!forecasts) {
        this.wos = [];
      }
    });
  }

  ngOnDestroy() {
    this.forecastSubscription.unsubscribe();   
  } 

  async initializeMap() {
    let component = this;
    try {
      const [EsriMap, EsriMapView, TileLayer, on, BasemapToggle, SketchViewModel, GraphicsLayer, Graphic, SpatialReference, Extent, KMLLayer] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        "esri/layers/TileLayer",
        "dojo/on",
        "esri/widgets/BasemapToggle",
        "esri/widgets/Sketch/SketchViewModel",
        "esri/layers/GraphicsLayer",
        'esri/Graphic',
        'esri/geometry/SpatialReference',
        'esri/geometry/Extent',
        "esri/layers/KMLLayer"
      ]);

      //set up layers
      var transportationLayer = new TileLayer({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
        opacity: 0.7,
        id: "streets"
      });
      this.tempGraphicsLayer = new GraphicsLayer();

      var kmllayer = new KMLLayer({
        url: component.herokuhost + "/downloadFile/KML_Samples.kml"
        // url: this.host + "/downloadFile/lines.kml"
      });

      //set up map    
      var map: esri.Map = new EsriMap({
        basemap: 'topo',
        layers: [transportationLayer, component.tempGraphicsLayer, kmllayer]
      });

      //set up mapview  
      var mapView: esri.MapView = new EsriMapView({
        container: component.mapViewEl.nativeElement,
        center: [23.8, 38.2],
        zoom: 7,
        map: map
      });

      //toggling basemaps
      var basemapToggle = new BasemapToggle({
        view: mapView,
        nextBasemap: "hybrid"
      });
      mapView.ui.add(basemapToggle, "bottom-right");

      //layer EVENTS
      on(component.streetsLayerEl.nativeElement, "change", function () {
        transportationLayer.visible = this.checked;
      });

      // when MapView gets ready
      mapView.when(() => {
        component.mapView = mapView;

        component.sketchViewModel = new SketchViewModel({
          view: component.mapView,
          layer: component.tempGraphicsLayer,
          pointSymbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            style: "square",
            color: "red",
            size: "7"
          },
          polylineSymbol: {
            type: "simple-line", // autocasts as new SimpleLineSymbol()
            color: "red",
            width: "4",
            style: "solid"
          },
          polygonSymbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: {
              r: 255,
              g: 0,
              b: 0,
              a: 0.7
            },
            style: "solid"
          }
        });
        component.sketchViewModel.on("create-complete", async (event) => {
          try {
            let [Graphic] = await loadModules([
              'esri/Graphic'
            ]);
            let component = this;
            let graphic = new Graphic({
              geometry: event.geometry,
              symbol: component.sketchViewModel.graphic.symbol,
              attributes: {
                'title': "title",
                'comments': "comments",
                'idReturned': undefined
              },
              popupTemplate: {
                title: "<p class='font-weight-bold'>{title}</p><hr>",
                content: `<textarea maxlength="250" rows="4" cols="42" style="overflow:auto"> {comments} </textarea> <hr>`
              }
            });

            // sets polyline property, unsets area property
            if (graphic.geometry.type == 'polyline') {
              component.getLengthOfPolyline(graphic.geometry.paths);
            }

            // sets area property, unsets polyline property
            if (graphic.geometry.type == 'polygon') {
              component.getAreaOfPolygons(graphic.geometry.rings);
            }

            // unsets area, polylineLength property
            if (graphic.geometry.type == 'point') {
              component.area = null;
              component.polylineLength = null;
            }
            component.type = null;
            component.selectedGraphic = null;
            component.latitude = null;
            component.longitude = null;
            //component.wos = [];

            component.tempGraphicsLayer.add(graphic);
          } catch (error) {
            console.log("component.sketchViewModel.on('create-complete'): " , error);
            component.area = null;
            component.polylineLength = null;
            component.type = null;
            component.selectedGraphic = null;
            component.latitude = null;
            component.longitude = null;
            //component.wos = [];
          }

        });
        component.sketchViewModel.on("update-complete", component.updateGraphic);
        component.sketchViewModel.on("update-cancel", component.updateGraphic);

        component.setUpClickHandler();


      });

    } catch (error) {
      console.log('Error loading the Map View: ' + error);
    }

  } //initializeMap() end  


  setUpClickHandler() {
    let component = this;
    component.mapView.on("click", function (event) {

      component.mapView.hitTest(event).then(function (response) {
        let results = response.results;
        if (results.length && results[results.length - 1].graphic) {
          component.selectedGraphic = results[results.length - 1].graphic;

          if (component.selectedGraphic.geometry.type == "polyline") {
            // this sets polylineLength property
            component.getLengthOfPolyline(( < any > results[results.length - 1].graphic.geometry).paths);
            component.latitude = null;
            component.longitude = null;
            component.type = null;
            component.area = null;
          } else if (component.selectedGraphic.geometry.type == "point") {
            component.latitude = ( < esri.Point > component.selectedGraphic.geometry).latitude;
            component.longitude = ( < esri.Point > component.selectedGraphic.geometry).longitude;
            component.type = ( < any > component.selectedGraphic).geometry.type;
            component.polylineLength = null;
            component.area = null;
          } else if (component.selectedGraphic.geometry.type == "polygon") {
            component.latitude = ( < esri.Polygon > component.selectedGraphic.geometry).centroid.latitude;
            component.longitude = ( < esri.Polygon > component.selectedGraphic.geometry).centroid.longitude;
            component.type = ( < any > component.selectedGraphic).geometry.type;
            component.polylineLength = null;
            // this sets area property
            component.getAreaOfPolygons(( < any > component.selectedGraphic.geometry).rings);
          }
          //console.log((<any>component.selectedGraphic.symbol).color.toHex());
        } else {
          component.selectedGraphic = null;
          component.latitude = null;
          component.longitude = null;
          component.polylineLength = null;
          component.area = null;
          component.type = null;
        }
        component.wos = [];
      });

    });
  }

  //draw a point/polyline/polygon/delete a graphic from view
  drawGrahic(event) {
    let buttonId = event.srcElement.id;

    switch (buttonId) {
      case "pointButton":
        {
          this.sketchViewModel.create("point");
          break;
        }

      case "polylineButton":
        {
          this.sketchViewModel.create("polyline");
          break;
        }

      case "polygonButton":
        {
          this.sketchViewModel.create("polygon");
          break;
        }

      case "editButton":
        {

          if (this.selectedGraphic != null) {
            this.sketchViewModel.update(this.selectedGraphic);
          } else {
            alert("Choose a graphic first!");
          }
          break;
        }

      case "resetButton":
        {
          if (this.selectedGraphic) {
            let what = confirm("Are you sure you want to delete the selected graphic?");
            if (what) {
              if (this.selectedGraphic.attributes && (this.selectedGraphic.attributes.idReturned == undefined || this.selectedGraphic.attributes.idReturned == null)) {
                this.tempGraphicsLayer.graphics.remove(this.selectedGraphic);
                this.mapView.goTo({
                  target: this.mapView.center,
                });
                this.selectedGraphic == null;
              } else {
                this.pointserviceService.deleteGraphic(this.selectedGraphic.attributes.idReturned).subscribe(results => {
                    console.log("Successfully deleted the graphic.");
                    this.tempGraphicsLayer.graphics.remove(this.selectedGraphic);
                    this.selectedGraphic == null;
                    this.mapView.goTo({
                      target: this.mapView.center,
                    });

                  },
                  error => {
                    console.log("Error in drawGrahic()-resetButton: ", error);

                  });
              }
            }
          } else {
            alert("Choose a graphic first!");
          }
          break;
        }
      default:
        {
          //component.wos = [];
          break;
        }
    }

  } //end drawGrahic()     

  updateGraphic(event) {
    let component = this;
    event.graphic.geometry = event.geometry;
    component.tempGraphicsLayer.add(event.graphic);
    component.tempGraphicsLayer.graphics.remove(component.selectedGraphic);
    component.mapView.goTo({
      target: component.mapView.center,
    });
    //component.wos = [];

  }


  saveGraphics() {
    let component = this;

    let graphicsCollection = component.tempGraphicsLayer.graphics;

    if (graphicsCollection.length > 0) {
      let graphicsToSave: Array < any > = [];
      let graphicsToDelete: Array < any > = [];

      for (let graphic of graphicsCollection.toArray()) {
        if (graphic.geometry.type === "point") {
          graphicsToDelete.push(graphic);
          let comments = graphic.attributes.comments;
          let title = graphic.attributes.title;
          let idReturned = graphic.attributes.idReturned;

          let latitude = ( < esri.Point > graphic.geometry).latitude;
          let longitude = ( < esri.Point > graphic.geometry).longitude;
          let type = graphic.geometry.type;
          let paths = null;
          let color = new Color(( < esri.SimpleMarkerSymbol > graphic.symbol).color.r, ( < esri.SimpleMarkerSymbol > graphic.symbol).color.b, ( < esri.SimpleMarkerSymbol > graphic.symbol).color.g);
          let graphicPoint = new Point(title, comments, latitude, longitude, color, paths, type, idReturned);
          graphicsToSave.push(graphicPoint);
        }

        if (graphic.geometry.type === "polyline") {
          graphicsToDelete.push(graphic);
          let comments = graphic.attributes.comments;
          let title = graphic.attributes.title;
          let idReturned = graphic.attributes.idReturned;
          let latitude = null;
          let longitude = null;
          let type = graphic.geometry.type;
          let paths = (( < esri.Polyline > graphic.geometry).paths).toString();
          let color = new Color(( < esri.SimpleLineSymbol > graphic.symbol).color.r, ( < esri.SimpleLineSymbol > graphic.symbol).color.b, ( < esri.SimpleLineSymbol > graphic.symbol).color.g);
          let graphicPolyline = new Point(title, comments, latitude, longitude, color, paths, type, idReturned);
          graphicsToSave.push(graphicPolyline);
        }

        if (graphic.geometry.type === "polygon") {
          graphicsToDelete.push(graphic);
          let comments = graphic.attributes.comments;
          let title = graphic.attributes.title;
          let idReturned = graphic.attributes.idReturned;
          // maybe i should save centroid ?
          let latitude = null;
          let longitude = null;
          let type = graphic.geometry.type;
          let paths = (( < esri.Polygon > graphic.geometry).rings).toString();
          let color = new Color(( < esri.SimpleFillSymbol > graphic.symbol).color.r, ( < esri.SimpleFillSymbol > graphic.symbol).color.b, ( < esri.SimpleFillSymbol > graphic.symbol).color.g);
          let graphicPolygon = new Point(title, comments, latitude, longitude, color, paths, type, idReturned);
          graphicsToSave.push(graphicPolygon);
        }
      }
      graphicsCollection.removeMany(graphicsToDelete);

      // component.pointserviceService.saveGraphics(graphicsToSave).subscribe(
      // results => { 
      // graphicsCollection.removeMany(graphicsToDelete);
      // // this.loadGraphics();        
      // }, 
      // error => {
      // console.log("Error saveGraphics: ", error);
      // }
      // );
    }
  }


  loadGraphics() {
    // let component = this;
    // let allGraphicsDesignedCurrently = component.tempGraphicsLayer.graphics;
    // allGraphicsDesignedCurrently.forEach(element => {
    //   // if (element.attributes.id == null) {
    //     allGraphicsDesignedCurrently.remove(element);
    //   // }
    // });

    // component.pointserviceService.getGraphics().subscribe(
    //   results => {     
    //   if (results.length > 0) {
    //     for (let graphic of results) {
    //       component.drawGraphicAfterLoading(graphic);
    //     }        
    //   }
    //   component.mapView.goTo({
    //     target: component.mapView.center ,
    //   });
    // }, 
    // error => {
    //   console.log("Error in loadGraphics(): ", error);

    // });
  }

  async drawGraphicAfterLoading(graphicFromServer) {
    let component = this;

    let [Graphic] = await loadModules([
      'esri/Graphic'
    ]);

    if (graphicFromServer.type == "point") {
      let lat = graphicFromServer.latitude;
      let lon = graphicFromServer.longitude;
      let r = graphicFromServer.color.r;
      let g = graphicFromServer.color.g;
      let b = graphicFromServer.color.b;
      let point = new Graphic({
        geometry: {
          type: "point",
          longitude: lon,
          latitude: lat
        },
        symbol: {
          type: "simple-marker",
          style: "square",
          color: {
            r: r,
            g: g,
            b: b,
            a: 1
          },
          size: 7
        },
        attributes: {
          title: graphicFromServer.title,
          comments: graphicFromServer.comments,
          idReturned: graphicFromServer.id,
        },
        popupTemplate: {
          title: "<p class='font-weight-bold'>{title}</p><hr>",
          content: `{comments} <br> <hr>`
        }

      });
      component.tempGraphicsLayer.graphics.add(point);
    }

    if (graphicFromServer.type == "polyline") {
      let r = graphicFromServer.color.r;
      let g = graphicFromServer.color.g;
      let b = graphicFromServer.color.b;
      let paths = component.makeArrayFromString(graphicFromServer.paths);

      let polyline = new Graphic({
        geometry: {
          type: "polyline",
          paths: paths,
          spatialReference: {
            wkid: 102100
          }
        },
        symbol: {
          type: "simple-line",
          style: "solid",
          color: {
            r: r,
            g: g,
            b: b,
            a: 1
          },
          width: 4
        },
        attributes: {
          title: graphicFromServer.title,
          comments: graphicFromServer.comments,
          idReturned: graphicFromServer.id,
        },
        popupTemplate: {
          title: "<p class='font-weight-bold'>{title}</p><hr>",
          content: `{comments} <br> <hr>`
        }

      });
      component.tempGraphicsLayer.graphics.add(polyline);
    }

    if (graphicFromServer.type == "polygon") {
      let r = graphicFromServer.color.r;
      let g = graphicFromServer.color.g;
      let b = graphicFromServer.color.b;
      let rings = this.makeArrayFromString(graphicFromServer.paths);

      let polygon = new Graphic({
        geometry: {
          type: "polygon",
          rings: rings,
          spatialReference: {
            wkid: 102100
          }
        },
        symbol: {
          type: "simple-fill",
          style: "solid",
          color: {
            r: r,
            g: g,
            b: b,
            a: 0.7
          },
        },
        attributes: {
          title: graphicFromServer.title,
          comments: graphicFromServer.comments,
          idReturned: graphicFromServer.id,
        },
        popupTemplate: {
          title: "<p class='font-weight-bold'>{title}</p><hr>",
          content: `{comments} <br> <hr>`
        }

      });
      component.tempGraphicsLayer.graphics.add(polygon);
    }

  } //end drawGrahicAfterLoading() 


  deleteGraphics() {
    let component = this;

    // component.pointserviceService.deleteGraphics().subscribe(
    //   results => {      
    //   console.log("Sucessful deleteGraphics()");
    // }, 
    // error => {
    //   console.log("Error in deleteGraphics(): ", error);
    // }
    // );
  }

  async changeColor(value) {
    // console.log(value);
    
    let component = this;
    var [Color] = await loadModules([
      'esri/Color'
    ]);

    if (component.selectedGraphic && component.selectedGraphic.symbol.declaredClass == "esri.symbols.SimpleMarkerSymbol") {
      ( < esri.SimpleMarkerSymbol > component.selectedGraphic.symbol).color = new Color(value);
      component.mapView.goTo({
        target: component.mapView.center,
      });
    }

    if (component.selectedGraphic && component.selectedGraphic.symbol.declaredClass == "esri.symbols.SimpleLineSymbol") {
      ( < esri.SimpleLineSymbol > component.selectedGraphic.symbol).color = new Color(value);
      component.mapView.goTo({
        target: component.mapView.center,
      });
    }

    if (component.selectedGraphic && component.selectedGraphic.symbol.declaredClass == "esri.symbols.SimpleFillSymbol") {
      ( < esri.SimpleFillSymbol > component.selectedGraphic.symbol).color = new Color(value);
      component.mapView.goTo({
        target: component.mapView.center,
      });
      ( < esri.SimpleFillSymbol > component.selectedGraphic.symbol).color.a = 0.7;
    }

        //console.log((<any>component.selectedGraphic.symbol).color.toHex());

  }

  changeTitle() {
    let component = this;
    let inputEl = < HTMLInputElement > document.getElementById("changeTitle");
    let newtitle = inputEl.value;
    if (!component.selectedGraphic) {
      alert("Choose a graphic first!");
    } else {
      component.selectedGraphic.attributes.title = newtitle;
      //inputEl.value = "";
      component.showSuccessTitle();
    }
  }

  showSuccessTitle() {
    let succesTitleEl = < HTMLElement > document.getElementById("succesTitle");
    succesTitleEl.classList.remove("hide");
    setTimeout(() => {
      succesTitleEl.classList.add("hide");
    }, 3000);
  }


  changeComments() {
    let component = this;
    let inputEl = < HTMLTextAreaElement > document.getElementById("changeComments");
    // console.log(inputEl);
    
    let newcomments = inputEl.value;
    if (!component.selectedGraphic) {
      alert("Choose a graphic first!");
    } else {
      component.selectedGraphic.attributes.comments = newcomments;
      //inputEl.value = "";
      component.showSuccessComments();
    }
  }

  showSuccessComments() {
    let succesCommentsEl = < HTMLElement > document.getElementById("succesComments");
    succesCommentsEl.classList.remove("hide");
    setTimeout(() => {
      succesCommentsEl.classList.add("hide");
    }, 3000);
  }

  // https://developers.arcgis.com/rest/services-reference/project.htm
  // For converting 102100 to 4326 wkid: Eg. https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project?f=json&inSR=102100&outSR=4326&geometries={'geometryType':'esriGeometryPolyline','geometries':[{'paths':[[[2657353.3318215227,4829996.637395144], [2647353.3318215227,4829296.637395144]]]}]}
  getLengthOfPolyline(pathsArray) {
    let component = this;
    let url = "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project?inSR=102100&outSR=4326&geometries={'geometryType':'esriGeometryPolyline','geometries':[{'paths':[[";
    let result2 = [];
    pathsArray[0].forEach(element => {
      result2.push(element);
    });
    let result = pathsArray[0].join("],[");
    result = url + "[" + result + "]]]}]}&f=json";
    this.areaInformationService.getLengthOfPolyline(result).subscribe((response) => {
      let paths = ( < any > response)._body.geometries[0].paths[0];
      if (paths.length > 1) {
        let polylineLength2 = 0;
        for (let j = 1; j < paths.length; j++) {
          // paths return [longitute, latitute] and 'distance' has lats first
          polylineLength2 += component.distance(paths[j - 1][1], paths[j - 1][0], paths[j][1], paths[j][0], "K");
        }
        //setting components polylineLength property      
        component.polylineLength = component.roundTo3Decimals(polylineLength2);

        if (component.area) {
          component.area = null;
        }

      }
    }, error => {
      console.log("getLengthOfPolyline : " , error);
    })
  }

  // For area: not working 17/2/2019. Eg.http://sampleserver6.arcgisonline.com/ArcGIS/rest/services/Utilities/Geometry/GeometryServer/areasAndLengths?lengthUnit=esriSRUnit_Kilometer&areaUnit=esriSquareKilometers&calculationType=preserveShape&sr=102100&polygons=[{%27rings%27:[[[2612714.107303003,4532503.723309314],[2429265.2394186286,4382075.651644127],[2320418.9111405667,4509266.8667106265],[2393798.458294316,4552071.602550314],[2612714.107303003,4532503.723309314]]]}]&f=json
  // For converting 102100 to 4326 wkid: Eg. https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project?inSR=102100&outSR=4326&geometries={%27geometryType%27:%27esriGeometryPolygon%27,%27geometries%27:[{%27rings%27:[[[2612714.107303003,4532503.723309314],[2429265.2394186286,4382075.651644127],[2320418.9111405667,4509266.8667106265],[2393798.458294316,4552071.602550314],[2612714.107303003,4532503.723309314]]]}]}&f=json
  getAreaOfPolygons(pathsArray) {
    let component = this;
    component.area = null;
    let url = "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project?inSR=102100&outSR=4326&geometries={'geometryType':'esriGeometryPolygon','geometries':[";

    if (pathsArray.length == 1) {
      url += "{'rings':[[";
      let result = pathsArray[0].join("],[");
      url += "[" + result + "]]]}]}&f=json";
      component.areaInformationService.getLengthOfPolyline(url).subscribe((response) => {
        let rings = ( < any > response)._body.geometries[0].rings[0];
        //console.log(rings);

        component.area = component.getAreaOfPolygon(rings);
        //console.log(component.area);

        if (component.polylineLength) {
          component.polylineLength = null;
        }
      }, error => {
        console.log("getAreaOfPolygons: " , error);
      })
    } else if (pathsArray.length > 1) {
      pathsArray.forEach(element => {
        url += "{'rings':[[";
        let result = element.join("],[");
        url += "[" + result + "]]]},";
      });
      let lastcommaindex = url.lastIndexOf(",");
      url = url.slice(0, lastcommaindex);
      url += "]}&f=json";
      component.areaInformationService.getLengthOfPolyline(url).subscribe((response) => {
        let geometries = ( < any > response)._body.geometries;
        let area = null;
        //console.log(geometries);

        geometries.forEach(element => {
          area += component.getAreaOfPolygon(element.rings[0]);
        });
        component.area = area;
        //console.log(component.area);

        if (component.polylineLength) {
          component.polylineLength = null;
        }

      }, error => {
        console.log("getAreaOfPolygons: " , error);
      })

    }
  }

  getAreaOfPolygon(array) {
    let component = this;
    let area = 0;
    let p1;
    let p2;
    for (let i = 0; i < array.length - 1; i++) {
      p1 = array[i];
      p2 = array[i + 1];
      area += component.convertToRadian(component.roundTo10Decimals(p2[0] - p1[0])) * (2 + Math.sin(component.convertToRadian(component.roundTo10Decimals(p1[1]))) + Math.sin(component.convertToRadian(component.roundTo10Decimals(p2[1]))));
    }
    area = area * 6378137 * 6378137 / 2;
    if (area > 500000) {
      area = area / 1000000;
      component.areaIndex = "Km";
    } else {
      component.areaIndex = "m";
    }
    return component.roundTo2Decimals(Math.abs(area));
  }

  distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    } else {
      lat1 = this.roundTo6Decimals(lat1);
      lat2 = this.roundTo6Decimals(lat2);
      lon1 = this.roundTo6Decimals(lon1);
      lon2 = this.roundTo6Decimals(lon2);
      let radlat1 = Math.PI * lat1 / 180;
      let radlat2 = Math.PI * lat2 / 180;
      let theta = lon1 - lon2;
      let radtheta = Math.PI * theta / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  }

  makeArrayFromString(arrayInString) {
    let returnedArray = [];
    let arrayWithCommas = arrayInString.split(",");
    let returnedArray2 = [];
    for (let i = 0; i < arrayWithCommas.length; i = i + 2) {
      let a = Number(arrayWithCommas[i]);
      let b = Number(arrayWithCommas[i + 1]);
      let littleArray = [];
      littleArray.push(a);
      littleArray.push(b);
      returnedArray.push(littleArray);
    }
    returnedArray2.push(returnedArray);
    return returnedArray2;
  }

  convertToRadian(input) {
    return input * Math.PI / 180;
  }

  roundTo6Decimals(num) {
    return Math.round(num * 1000000) / 1000000;
  }

  roundTo10Decimals(num) {
    return Math.round(num * 10000000000) / 10000000000;
  }

  roundTo2Decimals(num) {
    return Math.round(num * 100) / 100;
  }

  roundTo3Decimals(num) {
    return Math.round(num * 1000) / 1000;
  }


  test() {
    console.log("this.selectedGraphic : " , this.selectedGraphic);
  }

  test2() {}

  onGet() {}
 

} //end SelectAreaComponent




// this.testbutton.nativeElement.onclick = () => {
//   console.log(this.testbutton2.nativeElement.value);

//   polylineGraphic.setAttribute("title", this.testbutton2.nativeElement.value);
//   // this.mapView.graphics.remove(polylineGraphic);  
// };

//  HELPING MODULES
//  var locatorTask = new Locator({
//   url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
// });   

// mapView.on("click", function(event) {      
//   event.stopPropagation();

//   var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
//   var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

//   mapView.popup.open({          
//       title: "Reverse geocode: [" + lon + ", " + lat + "]",
//       location: event.mapPoint 
//   });

//   locatorTask.locationToAddress(event.mapPoint).then(function(response) {
//     mapView.popup.content = response.address;
//   }).catch(function(error) {
//     mapView.popup.content = "No address was found for this location";
//   });
// }); 



// mapView.on("key-down", function(event) {    
//   if (event.key === "Delete" && (editGraphic != null || editGraphic != undefined) ) {   
//     console.log(editGraphic);

//       tempGraphicsLayer.remove(editGraphic);
//       sketchViewModel.reset();
//       console.log("Removed tempGraphicsLayer");
//       console.log(tempGraphicsLayer);

//   }
// });        


// setActiveButton(selectedButton) {
//       this.mapView.focus();
//       var elements = document.getElementsByClassName("active");
//       for (var i = 0; i < elements.length; i++) {
//         elements[i].classList.remove("active");
//       }
//       if (selectedButton) {
//         selectedButton.classList.add("active");
//         // this.theselbut = selectedButton;
//         // selectedButton.classList.remove("active");
//         // setTimeout(() => {}, 1000)
//       }
//     }