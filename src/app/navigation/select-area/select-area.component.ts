import { Component, OnInit ,ElementRef,ViewChild} from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri;
import { Color } from './../../color.model';
import { Point } from './../../point.model';

import { PointserviceService } from './../../pointservice.service';

import * as $ from 'jquery';

@Component({
  selector: 'app-select-area',
  templateUrl: './select-area.component.html',
  styleUrls: ['./select-area.component.css']
})

export class SelectAreaComponent implements OnInit {

  private mapView: esri.MapView;
  private tempGraphicsLayer: esri.GraphicsLayer;
  private sketchViewModel: esri.SketchViewModel;

  private deleteGraphic: esri.Graphic;

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;
  @ViewChild('streetsLayer') private streetsLayerEl: ElementRef;
  @ViewChild('fire') private fireEl: ElementRef;

  constructor(private pointserviceService: PointserviceService) { }

  ngOnInit() {      
    this.initializeMap();
  }

  ngOnDestroy() {
  }

  async initializeMap() {
    try {
      const [EsriMap, EsriMapView, TileLayer, on, BasemapToggle,SketchViewModel,GraphicsLayer,Graphic, SpatialReference, Extent, KMLLayer] = await loadModules([
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
        // major earthquakes for latest 30 days from USGS
        //url: "https://earthquake.usgs.gov/fdsnws/event/1/query?format=kml&minmagnitude=5.8"
        //url: "https://sleepy-brook-85346.herokuapp.com/downloadFile/lines.kml"
        // url: "https://sleepy-brook-85346.herokuapp.com/downloadFile/KML_Samples.kml"  
        url: "https://sleepy-brook-85346.herokuapp.com/downloadFile/instabul.kml"      
      });


      //set up map    
      var map: esri.Map = new EsriMap({
        basemap: 'topo',
        layers: [transportationLayer, this.tempGraphicsLayer, kmllayer]
      });     

      //set up mapview  
      var mapView: esri.MapView = new EsriMapView({
        container: this.mapViewEl.nativeElement,
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
      on(this.streetsLayerEl.nativeElement, "change", function(){
        transportationLayer.visible = this.checked;
      });    
      
      // when MapView gets ready
      mapView.when(() => {  
        this.mapView = mapView;    

        this.sketchViewModel = new SketchViewModel({
          view:  this.mapView,
          layer: this.tempGraphicsLayer,
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
        this.sketchViewModel.on("create-complete", addGraphic);
        this.sketchViewModel.on("update-complete", updateGraphic);
        this.sketchViewModel.on("update-cancel", updateGraphic);

        let sketchViewModelInside = this.sketchViewModel;
        let tempGraphicsLayerInside = this.tempGraphicsLayer;
        let thisS = this;

        function addGraphic(event) { 
          let graphic = new Graphic({
            geometry: event.geometry,
            symbol: sketchViewModelInside.graphic.symbol,
            attributes: {
              title: "title",
              comments: "comments",
              idReturned: undefined
            },
            popupTemplate: {
            title: "<p class='font-weight-bold'>{title}</p><hr>",
            content: `{comments} <br> <hr>`  
            }     
          });                
          tempGraphicsLayerInside.add(graphic);
        }    

        function updateGraphic(event) {           
            event.graphic.geometry = event.geometry;
            thisS.tempGraphicsLayer.add(event.graphic);
            thisS.tempGraphicsLayer.graphics.remove(thisS.deleteGraphic);
            this.mapView.goTo({
              target: this.mapView.center ,
            });
            thisS.deleteGraphic = event.graphic;
        }
        this.setUpClickHandler();
      }); 

    } catch (error) {
      console.log('We have an error loading the Map View: ' + error);
    }

  } //initializeMap() end  

  drawGrahic(event) {   
    let buttonId = event.srcElement.id;
    
    switch (buttonId) { 
      case "pointButton": {
        this.sketchViewModel.create("point");        
         break; 
      } 

      case "polylineButton": {        
        this.sketchViewModel.create("polyline");       
         break; 
      } 

      case "polygonButton": {        
        this.sketchViewModel.create("polygon");       
         break; 
      } 

      case "resetButton": {       
        if (this.deleteGraphic) {
          let what = confirm("Are you sure you want to delete the selected graphic?");
          if (what) {          
            if (this.deleteGraphic.attributes.idReturned === undefined) {
              console.log(this.deleteGraphic.attributes.idReturned);
              
              this.tempGraphicsLayer.graphics.remove(this.deleteGraphic);
              this.mapView.goTo({
                target: this.mapView.center ,
              });
              this.deleteGraphic == null;   
            } else {
              this.pointserviceService.deleteGraphic(this.deleteGraphic.attributes.idReturned).subscribe(results => {
                console.log(this.deleteGraphic.attributes.idReturned);

                console.log("Deleted 1 graphic?");
                this.tempGraphicsLayer.graphics.remove(this.deleteGraphic);
                this.deleteGraphic == null;   
                
                this.mapView.goTo({
                  target: this.mapView.center ,
                });
                
              } , 
              error => {
          
                console.log("Error deleting 1 graphic ! ! !");
          
                console.log(error);                  
          
              });
            }
          }

        }
        break;
      }

      default: { 
         break; 
      } 
   } 
  
  } //end drawGrahic()    

  async drawGraphicAfterLoading(graphicFromServer) {    

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
    this.tempGraphicsLayer.graphics.add(point); 
    }  
    if (graphicFromServer.type == "polyline") { 
    let r = graphicFromServer.color.r;
    let g = graphicFromServer.color.g;
    let b = graphicFromServer.color.b;
    let paths = this.makeArrayFromString(graphicFromServer.paths);
    
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
    this.tempGraphicsLayer.graphics.add(polyline); 
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
      this.tempGraphicsLayer.graphics.add(polygon); 
      }


  } //end drawGrahicAfterLoading() 

   async changeColor(value) {  
    var [Color] = await loadModules([
      'esri/Color'      
    ]);      
    
    if (this.deleteGraphic && this.deleteGraphic.symbol.declaredClass == "esri.symbols.SimpleMarkerSymbol") {
      (<esri.SimpleMarkerSymbol> this.deleteGraphic.symbol).color = new Color(value);
      this.mapView.goTo({
        target: this.mapView.center ,
      });      
    } 

    if (this.deleteGraphic && this.deleteGraphic.symbol.declaredClass == "esri.symbols.SimpleLineSymbol") {
      (<esri.SimpleLineSymbol> this.deleteGraphic.symbol).color = new Color(value);
      this.mapView.goTo({
        target: this.mapView.center ,
      });      
    } 

    if (this.deleteGraphic && this.deleteGraphic.symbol.declaredClass == "esri.symbols.SimpleFillSymbol") {
      (<esri.SimpleFillSymbol> this.deleteGraphic.symbol).color = new Color(value);
      this.mapView.goTo({
        target: this.mapView.center ,
      });
      (<esri.SimpleFillSymbol> this.deleteGraphic.symbol).color.a = 0.7;
    } 
  }

  loadGraphics() {
    this.pointserviceService.getGraphics().subscribe(results => {

      // let graphicsNow = thisS.tempGraphicsLayer.graphics;
      // graphicsNow.forEach(element => {
      //   if (element.attributes.id == null) {
      //     graphicsNow.remove(element);
      //   }
      // });

      console.log("Getted?");

      console.log(results);

      if (results.length > 0) {
        for (let graphic of results) {
          this.drawGraphicAfterLoading(graphic);
        }        
      }
      this.mapView.goTo({
        target: this.mapView.center ,
      });
    } , 
    error => {

      console.log("Error Getting ! ! !");

      console.log(error);                  

    });
  } 

  saveGraphics() {
    let graphicsCollection = this.tempGraphicsLayer.graphics;

    if (graphicsCollection.length > 0) {
      let graphicsToSave: Array<Point> = [];
      let graphicsToDelete = [];      
    
      for (let graphic of graphicsCollection.toArray()) {
        if (graphic.geometry.type === "point") {
          graphicsToDelete.push(graphic);
          let comments = graphic.attributes.comments;
          let title = graphic.attributes.title;
          let idReturned = graphic.attributes.idReturned;

          let latitude = (<esri.Point> graphic.geometry).latitude;          
          let longitude = (<esri.Point> graphic.geometry).longitude;
          let type = graphic.geometry.type;
          let paths = null;
          let color = new Color( (<esri.SimpleMarkerSymbol> graphic.symbol).color.r,(<esri.SimpleMarkerSymbol> graphic.symbol).color.b,(<esri.SimpleMarkerSymbol> graphic.symbol).color.g );          
          let graphicPoint = new Point(title, comments, latitude , longitude , color, paths, type, idReturned);
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
          let paths = ((<esri.Polyline> graphic.geometry).paths).toString();
          let color = new Color( (<esri.SimpleLineSymbol> graphic.symbol).color.r,(<esri.SimpleLineSymbol> graphic.symbol).color.b,(<esri.SimpleLineSymbol> graphic.symbol).color.g );          
          let graphicPolyline = new Point(title, comments, latitude , longitude , color, paths, type, idReturned);
          graphicsToSave.push(graphicPolyline);
        }     

        if (graphic.geometry.type === "polygon") {
          graphicsToDelete.push(graphic);
          let comments = graphic.attributes.comments;
          let title = graphic.attributes.title;
          let idReturned = graphic.attributes.idReturned;
          let latitude = null;          
          let longitude = null;
          let type = graphic.geometry.type;
          let paths = ((<esri.Polygon> graphic.geometry).rings).toString();
          let color = new Color( (<esri.SimpleFillSymbol> graphic.symbol).color.r,(<esri.SimpleFillSymbol> graphic.symbol).color.b,(<esri.SimpleFillSymbol> graphic.symbol).color.g );          
          let graphicPolygon = new Point(title, comments, latitude , longitude , color, paths, type, idReturned);
          graphicsToSave.push(graphicPolygon);
        }       

      }   
    
      
      this.pointserviceService.saveGraphics(graphicsToSave).subscribe(results => {
        console.log("Saved?");
        
        console.log(results);        
      
        graphicsCollection.removeMany(graphicsToDelete);
        this.loadGraphics();
        
      } , 
      error => {
        console.log("Error Saving ! ! !");

        console.log(error);                  

      });
    }
    
  }

  deleteGraphics() {
    this.pointserviceService.deleteGraphics().subscribe(results => {
      console.log("Deleted?");
      
      console.log(results);
      
    } , 
    error => {
      console.log("Error Deleting ! ! !");

      console.log(error);                  

    });;
  }  

  makeArrayFromString(arrayInString) {
    let returnedArray = [];
    let arrayWithCommas = arrayInString.split(",");
    let returnedArray2 = [];


    for (let i = 0; i < arrayWithCommas.length; i = i + 2) {
      let a = Number(arrayWithCommas [i]);
      let b = Number(arrayWithCommas [i + 1]);
      let littleArray = [];
      littleArray.push(a);
      littleArray.push(b);
      returnedArray.push(littleArray);
    }
    returnedArray2.push(returnedArray);
    return returnedArray2;
  }

  changeTitle() {
    let inputEl = <HTMLInputElement> document.getElementById("changeTitle");
    let newtitle = inputEl.value;   
    if (!this.deleteGraphic) {
      alert("Choose a graphic first!");
    } else {
      this.deleteGraphic.attributes.title = newtitle;   
      inputEl.value = "";
      this.showSuccessTitle();
    }
  }

  showSuccessTitle() {
    let succesTitleEl = <HTMLElement> document.getElementById("succesTitle");
    succesTitleEl.classList.remove("hide");
    setTimeout(() => {
      succesTitleEl.classList.add("hide");      
  }, 3000);
  }
  

  changeComments() {
    let inputEl = <HTMLInputElement> document.getElementById("changeComments");
    let newcomments = inputEl.value;
    if (!this.deleteGraphic) {
      alert("Choose a graphic first!");
    } else {
      this.deleteGraphic.attributes.comments = newcomments;  
      inputEl.value = "";
      this.showSuccessComments();
    }
  }

  showSuccessComments() {
    let succesCommentsEl = <HTMLElement> document.getElementById("succesComments");
      succesCommentsEl.classList.remove("hide");      
      setTimeout(() => {
            succesCommentsEl.classList.add("hide");      
     }, 3000);


  }

  setUpClickHandler() {
    let view =  this.mapView;
    let self = this;

    view.on("click", function(event) {
      
      view.hitTest(event).then(function(response) {
        
        var results = response.results;
        if (results.length && results[results.length - 1].graphic) {  
          self.deleteGraphic = results[results.length - 1].graphic;   
        } else {
          self.deleteGraphic = null;
        }
      }).then( 
        () => {          
          if (self.deleteGraphic != null) {           
            self.sketchViewModel.update(self.deleteGraphic);
          }          
        }
      );
    });
  }  

  test() {
    console.log(this.tempGraphicsLayer.graphics);
  }

  test2() {  
  }

  get() {
    this.fireEl.nativeElement.innerText = "?";

    }




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