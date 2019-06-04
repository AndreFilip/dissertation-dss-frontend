import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  Router
} from '@angular/router';

import esri = __esri;
import {
  loadModules
} from 'esri-loader';

import {
  Color
} from './../../color.model';
import {
  Graphic
} from '../../graphic.model';

import {
  GraphicsService
} from '../../graphics.service';
import {
  AreaInformationService
} from './area-information/area-information.service';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ModalComponent
} from '../../components/modal/modal.component';

import * as $ from 'jquery';
import { FileService } from 'src/app/file.service';

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
  private index;
  private wos = [];
  private changeCommentsEl;
  private changeTitleEl;
  private succesEditedGraphicEl;
  private errorEditedGraphicEl;
  private isIndexAvailable: boolean;
  private indexDescription: string;
  private fileExists: boolean;

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;
  @ViewChild('streetsLayer') private streetsLayerEl: ElementRef;
  @ViewChild('fire') private fireEl: ElementRef;
  @ViewChild('files') private files: ElementRef;
  @ViewChild('uploadfile') private uploadfile: ElementRef;  

  constructor(private graphicsService: GraphicsService, private areaInformationService: AreaInformationService, private router: Router,
    private modalService: NgbModal , private fileService: FileService) {}

  private localhost: string = "localhost:8080";

  ngOnInit() {
    this.initializeMap();
    this.initializeWeatherSubscriber();
    this.changeCommentsEl = < HTMLTextAreaElement > document.getElementById("changeComments");
    this.changeTitleEl = < HTMLInputElement > document.getElementById("changeTitle");
    this.succesEditedGraphicEl = < HTMLElement > document.getElementById("succesEditedGraphicEl");
    this.errorEditedGraphicEl = < HTMLElement > document.getElementById("errorEditedGraphicEl");    
    this.areaInformationService.fireIndexObservable.subscribe((index) => {
      this.index = index;
      if (index != -1) {
        this.decideIndexDescription(index);
      }
    });

  }

  ngOnDestroy() {
    //this.saveGraphics(false);
  }

  //forecasted weather
  initializeWeatherSubscriber() {
    this.areaInformationService.forecasts.subscribe((result) => {
      if (result.forecasts && this.latitude && this.longitude && this.wos.length == 0) {
        this.areaInformationService.getWeatherForecastData(this.latitude, this.longitude).subscribe((data) => {
          //console.log(data);
          if (( < any > data).cod == 200) {
            this.wos = ( < any > data).list;
            this.isIndexAvailable = result.isIndexAvailable;
            this.scrollToAnchor("forecasts", 200);
          }
        });
      }
      if (!result.forecasts) {
        this.wos = [];
      }
    });

  }

  async initializeMap() {
    let component = this;
    try {
      const [EsriMap, EsriMapView, TileLayer, on, BasemapToggle, SketchViewModel, GraphicsLayer, Graphic, SpatialReference, Extent, KMLLayer, 
        BasemapGallery, Print, Compass, Fullscreen, LayerList, MapImageLayer] = await loadModules([
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
        "esri/layers/KMLLayer",
        "esri/widgets/BasemapGallery",
        "esri/widgets/Print",
        "esri/widgets/Compass",
        "esri/widgets/Fullscreen",
        "esri/widgets/LayerList",
        "esri/layers/MapImageLayer"
      ]);

      //set up layers
      var transportationLayer = new TileLayer({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
        opacity: 0.7,
        id: "streets",
        visible: false
      });

      var nat_geo_layer = new TileLayer({
        url: "https://server.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer",
        opacity: 0.7,
        id: "nat_geo_layer",
        visible: false
      });      

      component.tempGraphicsLayer = new GraphicsLayer({title: "Graphics Layer"});

      //set up map    
      var map: esri.Map = new EsriMap({
        basemap: 'topo',
        layers: [transportationLayer, nat_geo_layer, component.tempGraphicsLayer]
      });

      //set up mapview  
      var mapView: esri.MapView = new EsriMapView({
        container: component.mapViewEl.nativeElement,
        center: [23.8, 38.2],
        zoom: 7,
        map: map
      });

      var fullscreen = new Fullscreen({
        view: mapView
      });
      mapView.ui.add(fullscreen, "top-left");

      var layerList = new LayerList({
        view: mapView
      });
      mapView.ui.add(layerList, "bottom-left");

      //toggling basemaps     
      var basemapGallery = new BasemapGallery({
        view: mapView
      });
      const maps = "#mapViewNode > div.esri-view-root > div.esri-ui > div.esri-ui-inner-container.esri-ui-corner-container > div.esri-ui-top-right.esri-ui-corner";
      const terrains = ".terrains";      
      $(maps).hide();
      on($(maps), "click", () => {
        $(terrains).toggle();
        $(maps).toggle();
      });
      on($(terrains), "click", () => {
        $(terrains).toggle();
        $(maps).toggle();
      });
      mapView.ui.add(basemapGallery, "top-right");

      //add print/download file
      var print = new Print({
        view: mapView,
        printServiceUrl:
          "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
        id: "myPrint"
      });
      const myPrint = "#mapViewNode > div.esri-view-root > div.esri-ui > div.esri-ui-inner-container.esri-ui-corner-container > div.esri-ui-bottom-right.esri-ui-corner";
      const myPrintIcon = "#myPrintIcon";
      $(myPrint).hide();     
      on($(myPrintIcon), "click", () => {
        $(myPrint).toggle();
      });
      mapView.ui.add(print, "bottom-right");

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
                'id': undefined,
                'colorId': undefined
              },
              popupTemplate: {
                title: "<p class='font-weight-bold' disabled>{title}</p><hr>",
                content: `<p disabled> {comments} </p> <hr>`
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

            //component.tempGraphicsLayer.add(graphic);
            component.saveGraphic(graphic);
          } catch (error) {
            console.log("component.sketchViewModel.on('create-complete'): ", error);
            component.area = null;
            component.polylineLength = null;
            component.type = null;
            component.selectedGraphic = null;
            component.latitude = null;
            component.longitude = null;
          }

        });

        function updateGraphic(event: any) {
            event.graphic.geometry = event.geometry;
            //save to DB
            component.saveGraphic(event.graphic);
            component.mapView.goTo({
              target: component.mapView.center,
            });

            let graphicToSave;
            switch (event.graphic.geometry.type) {
              case "point":
                graphicToSave = new Graphic(event.graphic.attributes.id, event.graphic.attributes.title, event.graphic.attributes.comments, ( < any > event.graphic.geometry).latitude,
                  ( < any > event.graphic.geometry).longitude, new Color(event.graphic.attributes.colorId, ( < any > event.graphic.symbol).color.r, ( < any > event.graphic.symbol).color.b,
                    ( < any > event.graphic.symbol).color.g), null, event.graphic.geometry.type);
                break;
              case "polyline":
                graphicToSave = new Graphic(event.graphic.attributes.id, event.graphic.attributes.title, event.graphic.attributes.comments, null, null,
                  new Color(event.graphic.attributes.colorId, ( < any > event.graphic.symbol).color.r, ( < any > event.graphic.symbol).color.b, ( < any > event.graphic.symbol).color.g),
                  (( < any > event.graphic.geometry).paths).toString(), event.graphic.geometry.type);
                break;
              case "polygon":
                graphicToSave = new Graphic(event.graphic.attributes.id, event.graphic.attributes.title, event.graphic.attributes.comments, ( < any > event.graphic.geometry).centroid.latitude,
                  ( < any > event.graphic.geometry).centroid.longitude, new Color(event.graphic.attributes.colorId, ( < any > event.graphic.symbol).color.r, ( < any > event.graphic.symbol).color.b, ( < any > event.graphic.symbol).color.g),
                  (( < any > event.graphic.geometry).rings).toString(), event.graphic.geometry.type);
                break;
            }

            component.graphicsService.saveGraphic(graphicToSave).subscribe(
              graphic => {
                console.log("Graphic edited successfully: " + JSON.stringify(graphic));
                component.drawGraphicAfterLoading(graphic);
                if (!component.selectedGraphic) {
                  component.tempGraphicsLayer.remove(component.selectedGraphic);
                }
                component.showSuccessComments();
              },
              error => {
                console.log("Error editing saveGraphics: " +  JSON.stringify(error));
                component.showErrorComments();
              }
            );
        }
        component.sketchViewModel.on("update-complete", updateGraphic);
        component.sketchViewModel.on("update-cancel", updateGraphic);
        component.setUpClickHandler();

      }).then(() => {
        component.getIfExists(component);

        this.loadGraphicsNoModal();
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
        // Check if graphic found
        if (results.length && results[results.length - 1].graphic) {
          component.selectedGraphic = results[results.length - 1].graphic;

          if (component.selectedGraphic.geometry.type == "polyline") {
            // this sets polyline's length property
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
            // this sets polygons' area property
            component.getAreaOfPolygons(( < any > component.selectedGraphic.geometry).rings);
            component.latitude = ( < esri.Polygon > component.selectedGraphic.geometry).centroid.latitude;
            component.longitude = ( < esri.Polygon > component.selectedGraphic.geometry).centroid.longitude;
            component.type = ( < any > component.selectedGraphic).geometry.type;
            component.polylineLength = null;
          }
          // No graphic found. Make all null.
        } else {
          component.selectedGraphic = null;
          component.latitude = null;
          component.longitude = null;
          component.polylineLength = null;
          component.area = null;
          component.type = null;
        }
        // Disappear weather forcasted if exists
        component.wos = [];
        component.index = null;
      });

    });
  }

  // Draw a point/polyline/polygon or edit/delete a graphic
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
              if (this.selectedGraphic.attributes && (this.selectedGraphic.attributes.id == undefined || this.selectedGraphic.attributes.id == null)) {
                this.tempGraphicsLayer.graphics.remove(this.selectedGraphic);
                this.mapView.goTo({
                  target: this.mapView.center,
                });
                this.selectedGraphic == null;
              } else if (this.selectedGraphic.attributes && (this.selectedGraphic.attributes.id != undefined || this.selectedGraphic.attributes.id != null)) {
                {
                  this.graphicsService.deleteGraphic(this.selectedGraphic.attributes.id).subscribe(results => {
                      console.log("Successfully deleted the graphic.");
                      this.tempGraphicsLayer.graphics.remove(this.selectedGraphic);
                      this.selectedGraphic == null;
                      this.mapView.goTo({
                        target: this.mapView.center,
                      });
                      this.openModal("Successfully deleted the graphic.");
                    },
                    error => {
                      console.log("Error in drawGrahic()-resetButton: ", error);
                      this.openModal("The graphic was not deleted. Please try again later.");
                    });
                }
              }
            } else {
              alert("Choose a graphic first!");
            }
            break;
          }
        }
      default:
        {
          // just in case
          break;
        }
    }

  } //end drawGrahic()

  async editTheGraphic(value: any) {
    let component = this;
    if (!component.selectedGraphic) {
      this.openModal("Choose a graphic first!");
    } else {
      try {
        var [Color] = await loadModules([
          'esri/Color'
        ]);
        ( < any > component.selectedGraphic.symbol).color = new Color(value);
        component.mapView.goTo({
          target: component.mapView.center,
        });
      } catch {
        this.openModal("Couldn't change graphic's color. Please try later!");
      }
      component.selectedGraphic.attributes.comments = component.changeCommentsEl.value;
      component.selectedGraphic.attributes.title = component.changeTitleEl.value;
      //save to DB
      component.saveGraphic(component.selectedGraphic);
      //component.showSuccessComments();
    }
  }

  saveGraphic(graphic: any) {
    let graphicToSave;
    switch (graphic.geometry.type) {
      case "point":
        graphicToSave = new Graphic(graphic.attributes.id, graphic.attributes.title, graphic.attributes.comments, ( < any > graphic.geometry).latitude,
          ( < any > graphic.geometry).longitude, new Color(graphic.attributes.colorId, ( < any > graphic.symbol).color.r, ( < any > graphic.symbol).color.b,
            ( < any > graphic.symbol).color.g), null, graphic.geometry.type);
        break;
      case "polyline":
        graphicToSave = new Graphic(graphic.attributes.id, graphic.attributes.title, graphic.attributes.comments, null, null,
          new Color(graphic.attributes.colorId, ( < any > graphic.symbol).color.r, ( < any > graphic.symbol).color.b, ( < any > graphic.symbol).color.g),
          (( < any > graphic.geometry).paths).toString(), graphic.geometry.type);
        break;
      case "polygon":
        graphicToSave = new Graphic(graphic.attributes.id, graphic.attributes.title, graphic.attributes.comments, ( < any > graphic.geometry).centroid.latitude,
          ( < any > graphic.geometry).centroid.longitude, new Color(graphic.attributes.colorId, ( < any > graphic.symbol).color.r, ( < any > graphic.symbol).color.b, ( < any > graphic.symbol).color.g),
          (( < any > graphic.geometry).rings).toString(), graphic.geometry.type);
        break;
    }

    this.graphicsService.saveGraphic(graphicToSave).subscribe(
      graphic => {
        console.log("Graphic saved successfully: " + JSON.stringify(graphic));
         this.drawGraphicAfterLoading(graphic);
        if (!this.selectedGraphic) {
          this.tempGraphicsLayer.remove(this.selectedGraphic);
        }
         this.showSuccessComments();
      },
      error => {
        console.log("Error saveGraphics: " +  JSON.stringify(error));
        this.showErrorComments();

      }
    );
  }

  // loadGraphic(id: string) {
  //   if (id) {
  //     this.graphicsService.getGraphic(id).subscribe(graphic => {
  //       console.log(graphic);
  //       if (graphic != null) {
  //         this.tempGraphicsLayer.graphics.remove(this.selectedGraphic);
  //         this.drawGraphicAfterLoading(graphic);
  //       }
  //     }, error => {
  //       console.log("Error in loadGraphic: " + error);
  //     })
  //   }
  // }

  saveGraphics(withmodal ? : boolean) {
    let component = this;
    let graphicsCollection = component.tempGraphicsLayer.graphics;
    if (graphicsCollection.length > 0) {
      let graphicsToSave: Array < any > = [];
      for (let graphic of graphicsCollection.toArray()) {
        let graphicToSave;
        switch (graphic.geometry.type) {
          case "point":
            graphicToSave = new Graphic(graphic.attributes.id, graphic.attributes.title, graphic.attributes.comments, ( < any > graphic.geometry).latitude,
              ( < any > graphic.geometry).longitude, new Color(graphic.attributes.colorId, ( < any > graphic.symbol).color.r, ( < any > graphic.symbol).color.b,
                ( < any > graphic.symbol).color.g), null, graphic.geometry.type);
            break;
          case "polyline":
            graphicToSave = new Graphic(graphic.attributes.id, graphic.attributes.title, graphic.attributes.comments, null, null,
              new Color(graphic.attributes.colorId, ( < any > graphic.symbol).color.r, ( < any > graphic.symbol).color.b, ( < any > graphic.symbol).color.g),
              (( < any > graphic.geometry).paths).toString(), graphic.geometry.type);
            break;
          case "polygon":
            graphicToSave = new Graphic(graphic.attributes.id, graphic.attributes.title, graphic.attributes.comments, ( < any > graphic.geometry).centroid.latitude,
              ( < any > graphic.geometry).centroid.longitude, new Color(graphic.attributes.colorId, ( < any > graphic.symbol).color.r, ( < any > graphic.symbol).color.b, ( < any > graphic.symbol).color.g),
              (( < any > graphic.geometry).rings).toString(), graphic.geometry.type);
            break;
        }
        graphicsToSave.push(graphicToSave);
      }
      component.graphicsService.saveGraphics(graphicsToSave).subscribe(
        results => {
          console.log("saveGraphics successfully: ", results);
          this.loadGraphicsNoModal();
          if (withmodal) {
            this.openModal('Map was saved successfully!');
          }
        },
        error => {
          console.log("Error saveGraphics: ", error);
          if (withmodal) {
            this.openModal('Error! Map was not saved!');
          }
        }
      );
    } else {
      if (withmodal) {
        this.openModal('Draw graphics first!');
      }
    }

  }

  openModal(message: string) {
    let modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.result = message;
  }


  loadGraphics() {
    let component = this;

    component.graphicsService.getGraphics().subscribe(
      results => {
        if (results.length > 0) {
          this.removeAllGraphicsFromMap();

          for (let graphic of results) {
            component.drawGraphicAfterLoading(graphic);
          }
          component.mapView.goTo({
            target: component.mapView.center,
          });
          this.openModal('Map was loaded successfully!');
        } else {
          this.openModal('No Map is saved in database!');
        }
      },
      error => {
        console.log("Error in loadGraphics(): ", error);
        this.openModal('Error in loading graphics! Map was not loaded!');
      });
  }

  loadGraphicsNoModal() {
    let component = this;
    component.graphicsService.getGraphics().subscribe(
      results => {
        if (results.length > 0) {
          this.removeAllGraphicsFromMap();

          for (let graphic of results) {
            component.drawGraphicAfterLoading(graphic);
          }
          component.mapView.goTo({
            target: component.mapView.center,
          });
        } else {}
      },
      error => {
        console.log("Error in loadGraphics(): ", error);
        this.openModal('Error in loading map after saving!');
      });
  }

  removeAllGraphicsFromMap() {
    this.tempGraphicsLayer.graphics.removeAll();
  }



  async drawGraphicAfterLoading(graphicFromServer: Graphic) {
    let component = this;
    let [Graphic] = await loadModules([
      'esri/Graphic'
    ]);

    if (graphicFromServer.type == "point") {
      let lat = graphicFromServer.latitude;
      let lon = graphicFromServer.longitude;
      let colorId = graphicFromServer.color.id;
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
          id: graphicFromServer.id,
          colorId: colorId
        },
        popupTemplate: {
          title: "<p class='font-weight-bold' disabled>{title}</p><hr>",
          content: `<p disabled> {comments} </p> <hr>`
        }

      });
      component.tempGraphicsLayer.graphics.add(point);
    }

    if (graphicFromServer.type == "polyline") {
      let colorId = graphicFromServer.color.id;
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
          id: graphicFromServer.id,
          colorId: colorId
        },
        popupTemplate: {
          title: "<p class='font-weight-bold' disabled>{title}</p><hr>",
          content: `<p disabled> {comments} </p> <hr>`
        }

      });
      component.tempGraphicsLayer.graphics.add(polyline);
    }

    if (graphicFromServer.type == "polygon") {
      let colorId = graphicFromServer.color.id;
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
          id: graphicFromServer.id,
          colorId: colorId
        },
        popupTemplate: {
          title: "<p class='font-weight-bold' disabled>{title}</p><hr>",
          content: `<p disabled> {comments} </p> <hr>`
        }

      });
      component.tempGraphicsLayer.graphics.add(polygon);
    }

  } //end drawGrahicAfterLoading() 


  deleteGraphics() {
    this.graphicsService.mapExists().subscribe((result) => {
      console.log(result);
      if (result.myresponse) {
        let what = confirm("Are you sure you want to delete you map ?");
        if (what) {
          this.graphicsService.deleteGraphics().subscribe(
            results => {
              console.log("Sucessful deleteGraphics()");
              this.removeAllGraphicsFromMap();
              this.openModal('Sucessfully deleted map!');
            },
            error => {
              console.log("Error in deleteGraphics(): ", error);
              this.openModal('Error in deleting map! Try again later!');
            }
          );
        }
      } else {
        this.openModal('No map found in database to delete!');
      }

    }, (error) => {
      this.openModal('An error occurred trying to delete the map. Please try again later.');
    })

  }  

  showSuccessComments() {
    this.succesEditedGraphicEl.classList.remove("hide");
    setTimeout(() => {
      this.succesEditedGraphicEl.classList.add("hide");
    }, 3000);
  }

  showErrorComments() {
    this.errorEditedGraphicEl.classList.remove("hide");
    setTimeout(() => {
      this.errorEditedGraphicEl.classList.add("hide");
    }, 3000);
  }

  // https://developers.arcgis.com/rest/services-reference/project.htm
  // For converting 102100 to 4326 wkid: Eg. https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project?f=json&inSR=102100&outSR=4326&geometries={'geometryType':'esriGeometryPolyline','geometries':[{'paths':[[[2657353.3318215227,4829996.637395144], [2647353.3318215227,4829296.637395144]]]}]}
  getLengthOfPolyline(pathsArray) {
    let component = this;
    let url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/project?inSR=102100&outSR=4326&geometries={'geometryType':'esriGeometryPolyline','geometries':[{'paths':[[";
    let result2 = [];
    pathsArray[0].forEach(element => {
      result2.push(element);
    });
    let result = pathsArray[0].join("],[");
    result = url + "[" + result + "]]]}]}&transformation=&transformForward=false&vertical=false&f=pjson";
    this.areaInformationService.getLengthOfPolyline(encodeURI(result)).subscribe((response) => {
      let paths = ( < any > response).geometries[0].paths[0];
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
      console.log("getLengthOfPolyline : ", error);
    })
  }

  // For area: not working 17/2/2019. Eg.http://sampleserver6.arcgisonline.com/ArcGIS/rest/services/Utilities/Geometry/GeometryServer/areasAndLengths?lengthUnit=esriSRUnit_Kilometer&areaUnit=esriSquareKilometers&calculationType=preserveShape&sr=102100&polygons=[{%27rings%27:[[[2612714.107303003,4532503.723309314],[2429265.2394186286,4382075.651644127],[2320418.9111405667,4509266.8667106265],[2393798.458294316,4552071.602550314],[2612714.107303003,4532503.723309314]]]}]&f=json
  // For converting 102100 to 4326 wkid: Eg. https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project?inSR=102100&outSR=4326&geometries={%27geometryType%27:%27esriGeometryPolygon%27,%27geometries%27:[{%27rings%27:[[[2612714.107303003,4532503.723309314],[2429265.2394186286,4382075.651644127],[2320418.9111405667,4509266.8667106265],[2393798.458294316,4552071.602550314],[2612714.107303003,4532503.723309314]]]}]}&f=json
  getAreaOfPolygons(pathsArray) {
    let component = this;
    component.area = null;
    let url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/project?inSR=102100&outSR=4326&geometries={'geometryType':'esriGeometryPolygon','geometries':[";

    if (pathsArray.length == 1) {
      url += "{'rings':[[";
      let result = pathsArray[0].join("],[");
      url += "[" + result + "]]]}]}&transformation=&transformForward=false&vertical=false&f=pjson";
      component.areaInformationService.getLengthOfPolyline(encodeURI(url)).subscribe((response) => {
        let rings = ( < any > response).geometries[0].rings[0];
        //console.log(rings);

        component.area = component.getAreaOfPolygon(rings);
        //console.log(component.area);

        if (component.polylineLength) {
          component.polylineLength = null;
        }
      }, error => {
        console.log("getAreaOfPolygons: ", error);
      })
    } else if (pathsArray.length > 1) {
      pathsArray.forEach(element => {
        url += "{'rings':[[";
        let result = element.join("],[");
        url += "[" + result + "]]]},";
      });
      let lastcommaindex = url.lastIndexOf(",");
      url = url.slice(0, lastcommaindex);
      url += "]}&transformation=&transformForward=false&vertical=false&f=pjson";
      component.areaInformationService.getLengthOfPolyline(encodeURI(url)).subscribe((response) => {
        let geometries = ( < any > response).geometries;
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
        console.log("getAreaOfPolygons: ", error);
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

  scrollToAnchor(location: string, wait: number): void {
    const element = document.querySelector('#' + location)
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
      }, wait)
    }
  }

  decideIndexDescription(index: number) {
    if (index >= 25) {
      this.indexDescription = "(Extreme!)"
    } else if (index >= 13) {
      this.indexDescription = "(High!)"
    } else if (index >= 6) {      
      this.indexDescription = "(Moderate)"
    } else if (index >= 2) {
      this.indexDescription = "(Low)"
    } else if (index >= 0) {
      this.indexDescription = "(Very Low)"
    } else {
      this.indexDescription = ""
    }
  }

  postMethod(files: FileList) {
    console.log(files);
    if (files && files.item(0)) {
      let fileToUpload = files.item(0); 
      let formData = new FormData(); 
      formData.append("file", fileToUpload); 
      this.fileService.uploadFile(formData).subscribe( response => {
        console.log(response);
        this.constructKml( (<any> response));
      }, error => {
        console.log(error);
      });
    }
  }

  async constructKml(resp) {
    try {
      const [ KMLLayer] = await loadModules([ 
        "esri/layers/KMLLayer"  
      ]);
      var kmllayer = new KMLLayer({
        url: resp.fileDownloadUri,
        title: "KML Layer"
      });
      var layer2 = this.mapView.map.layers.getItemAt(3);
      this.mapView.map.layers.remove(layer2);
      this.mapView.map.layers.add(kmllayer);    
      this.fileExists = true;
      this.files.nativeElement.innerText = resp.fileName;

    } catch (error) {
      
    }

  }

  async getIfExists(component) {
    try {
      const [ KMLLayer] = await loadModules([ 
        "esri/layers/KMLLayer"  
      ]);
      component.fileService.getIfExists().subscribe( r => {
        console.log(r);
        var kmllayer = new KMLLayer({
          url: r.result,
          title: "KML Layer"
        });
        component.mapView.map.layers.add(kmllayer); 
        component.fileExists = true;          
        component.files.nativeElement.innerText = r.filename;
      }, e => {
        console.log(e);
        
      });
      
  
    } catch (error) {
      
    }  
        

    
  }

  deleteFile() {
    this.fileService.deleteFile().subscribe(response => {
      var layer = this.mapView.map.layers.getItemAt(3);
      this.mapView.map.layers.remove(layer);
      console.log(this.files.nativeElement);
      this.files.nativeElement.innerText = "Upload Kml";
      this.fileExists = false;
      this.uploadfile.nativeElement.value = null;
    }, error => {
      console.log(error);
    });
  }

} //end SelectAreaComponent



