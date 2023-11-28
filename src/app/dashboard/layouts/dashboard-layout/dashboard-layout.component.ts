import { Component, ViewChild, computed, inject, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'
import { UtilsService } from 'src/app/auth/services/utils.service';
import * as moment from 'moment'
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource, } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import * as FileSaver from 'file-saver';



@Component({
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements AfterViewInit, OnChanges {
  public dataSource = new MatTableDataSource<any>([]);
  @ViewChild('fileinput') public fileinput!: any;
  @ViewChild(BaseChartDirective) public chart!: BaseChartDirective
  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  private authService = inject( AuthService );
  public arrayBuffer:any;
  public loading: boolean = false;
  public filedata:any = null;
  public json:any
  public dataJson:any =[]
  public encabezado: any ={
    "idTurno": null,
    "idServicio": null,
    "numTurno": null,
    "region": null,
    "fechaCreacion": null,
    "oficina": null,
    "sala": null,
    "cliente": null,
    "tipoCliente": null,
    "proceso": null,
    "subproceso": null,
    "agrupamiento": null,
    "tramite": null,
    "cola": null,
      "anioMes": null,
      "horaSolicitud": null,
      "horaFinEspera": null,
      "horaLlamado": null,
      "horaFinLlamado": null,
      "horaFinAtencion": null,
      "espera": null,
      "llamado": null,
      "atencion": null,
      "total": null,
      "usuario": null,
      "nombreUsuario": null,
      "terminal": null,
      "estado": null,
      "dia": null,
      "hora": null,
      "nombreCliente": null,
      "razonSocial": null,
      "identificacion": null,
      "tipoIdentificacion": null,
      "serInscripcionRut": null,
      "serNumeroFormulario": null,
      "serCantidadFolios": null,
      "serResultadoDelTramite": null,
      "serGestionDelCasoAPST": null,
      "serObservaciones": null,
      "serTemaDeCapacitacionOrientacion": null,
      "serOtrosServicios": null,
      "serActualizacionRut": null,
      "serLevantamientoSuspension": null,
      "serObjetoDeCampana": null,
      "serResultadoCobranzas": null,
      "serMensajeDeRespuesta": null,
      "turTipoDeIdentificacionTramitante": null,
      "turClasificacionTramitante": null
    }
    public dates:any = {
      init:null,
      end:null
    }


    public datesSearch:any = {
      init:null,
      end:null
    }

    public reloadGraficos: boolean = false;
    public displayedColumns: string[] = ['idTurno',	'idServicio',	'numTurno',	'region',	'fechaCreacion',	'oficina',	'sala',	'cliente',	'tipoCliente',	'proceso',	'subproceso',	'agrupamiento',	'tramite',	'cola',	'anioMes',	'horaSolicitud']
    public ruta: string = 'archivo'
    public user = computed(() => this.authService.currentUser() );
    public filedataCopy : any = null;
    public downloadExcelFile : any[] = [];


    public lineChartLabels: Array<any> = [];
    public lineChartLabelTwo: Array<any> = [];
    public lineChartLabelsTree: Array<any> = [];


    public lineChartData: Array<any> = [
      { data: [  ], label: 'Reporte de tramites'},
    ];

    public lineChartDataTwo: Array<any> = [
      { data: [  ], label: 'Reporte de estados'},
    ];


    public lineChartDatatree: Array<any> = [
      { data: [  ], label: 'Reporte tiempo de atencion'},
    ];




    constructor (private _service : UtilsService){}



  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.paginator = this.paginator;




  }


  // get user() {
  //   return this.authService.currentUser();
  // }

  public onLogout() {
    this.authService.logout();
  }

  public changeRuta(ruta: string): void {
    this.ruta = ruta;

    this.reloadGraficos = false;

   this.lineChartLabels = [];
    this.lineChartLabelTwo = [];
    this.lineChartLabelsTree = [];


    this.lineChartData = [
      { data: [  ], label: 'Reporte de tramites'},
    ];

    this.lineChartDataTwo= [
      { data: [ ], label: 'Reporte de estados'},
    ];


    this.lineChartDatatree = [
      { data: [  ], label: 'Reporte tiempo de atencion'},
    ];

    this.borrar();


  }

  public incomingfile(event: any)
  {

  this.filedata= event.target.files[0];
  console.log('this.filedata',this.filedata, event)
  this.filedataCopy = event
  }

  public startLoading({ title = 'Cargando', html = 'Por favor espere' }): void {

    Swal.fire({ title, html, allowOutsideClick: false, timer: 500000, didOpen: () => { Swal.showLoading() }, })

  }

  public stopLoading(): void {
    Swal.close();
  }

  public alertSuccess(): void {


    Swal.fire({
      allowOutsideClick: true,
      backdrop: true,
      title: 'Correcto!',
      text: "Solicitud realizada correctamente",
      icon: 'success',
      confirmButtonColor: '#3085d6',
      customClass: {
        confirmButton: 'rounded-full w-20 bg-blue-400 ring-0'
      }
    })
  }

  public loadArchivo(): void {


    const content2:HTMLElement= document.getElementById('fileinput') as HTMLElement;
    content2.click();




  }

  public Upload() {

    if(!this.filedata){
      const param = {
        icon: 'info',
        title: 'Info!',
        text:'Por favor seleccionar un archivo para guardar'
      }
      this.alertError(param);
      return;
    }



    this.loading = true;
    this.startLoading({});
    this.dataJson = []

    const encabezadosArray = Object.keys(this.encabezado)
    let fileReader = new FileReader();
      fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();

          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary"});
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          console.log(worksheet);
          this.json = XLSX.utils.sheet_to_json(worksheet,{raw:true})


          this.json.forEach((element:any) => {

            const nombresExcel = Object.keys(element)
            const row:any = {}
            encabezadosArray.forEach((encabezado, index)=>{
              if(encabezado === 'fechaCreacion'){

                row[encabezado] = element[nombresExcel[index]]!=='' ? moment(element[nombresExcel[index]],  'DD/MM/YYYY h:mm:ss a').format('YYYY-MM-DD') : null
              }else{

                row[encabezado] = element[nombresExcel[index]]!=='' ? element[nombresExcel[index]] : null

              }
            })

            this.dataJson.push({...row})


          });

            this.displayedColumns= Object.keys(this.encabezado);
            this.dataSource =  new MatTableDataSource<any>([...this.dataJson]);
            this.dataSource.paginator = this.paginator;
            this.guardarData([...this.dataJson]);


      }
      fileReader.readAsArrayBuffer(this.filedata);

    }


    public downloadExcel(): void {

      this.startLoading({});

      setTimeout(() => {
        this.exportAsExcelFile(this.downloadExcelFile,'Resumen consulta informe');
        this.stopLoading();
      }, 500);

    }

    public exportAsExcelFile(json: any[], excelFileName: string): void {
      const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
      const myworkbook: XLSX.WorkBook = { Sheets: { 'data': myworksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
  }

    public saveAsExcelFile(buffer: any, fileName: string): void {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName + ''+ EXCEL_EXTENSION);
  }


    public borrar(): void {
      this.json = null
      this.downloadExcelFile = []
      this.dataJson = null
      this.filedata = null
      this.dataSource =  new MatTableDataSource<any>([]);
      this.dataSource.paginator = this.paginator;
      this.displayedColumns = ['idTurno',	'idServicio',	'numTurno',	'region',	'fechaCreacion',	'oficina',	'sala',	'cliente',	'tipoCliente',	'proceso',	'subproceso',	'agrupamiento',	'tramite',	'cola',	'anioMes',	'horaSolicitud']

      const inputFile = this.fileinput?.nativeElement?.value || null
      if(!!inputFile){
        this.fileinput.nativeElement.value = '';
      }
    }


    public filtrarData(value : string): void {
      value = value?.trim()?.toUpperCase();
      this.dataSource.filter = value;
    }




  public alertError(param: any = {}): void {

    // this.stopLoading();

    Swal.fire({
      allowOutsideClick: true,
      backdrop: true,
      title: param.title || 'Error!',
      text: param.text || "Su solicitud no pudo ser procesada, por favor intente nuevamente",
      icon: param.icon || 'error',
      customClass: {
        confirmButton: 'rounded-full w-20 bg-gray-400 ring-0'
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


    public guardarData(data: any): void {



      this._service.guardarData(data).subscribe({
        next:(resp)=>{

          this.stopLoading();
          this.alertSuccess();

          this.json = null
          this.dataJson = null
          this.filedata = null
          this.fileinput.nativeElement.value = '';


        },
        error:()=>{
          this.stopLoading();
          this.alertError();
        }
      })
    }

    public loadGraficos(): void {

      this.reloadGraficos = false
      this.startLoading({});

      this.lineChartLabels = [];
      this.lineChartLabelTwo = [];
      this.lineChartLabelsTree = [];


      this.lineChartData = [
        { data: [ ], label: 'Reporte de tramites'},
      ];

      this.lineChartDataTwo= [
        { data: [  ], label: 'Reporte de estados'},
      ];


      this.lineChartDatatree = [
        { data: [  ], label: 'Reporte tiempo de atencion'},
      ];

      if( !this.dates.init || !this.dates.end ){
        const param= {
          title: 'Info!',
          text:  "Por favor seleccione la fecha de inicio y fecha final para realizar la busqueda",
          icon: 'info',
        }
        this.alertError(param);
        return
      }
      if( this.dates.init > this.dates.end ){
        const param= {
          title: 'Info!',
          text:  "Por favor la fecha de inicio debe ser inferior a la  fecha final para realizar la busqueda",
          icon: 'info',
        }
        this.alertError(param);
        return
      }

      // console.log(this.dates,'this.dates')

      const rangos = {
        fechaInicial: this.dates.init ,
        fechaFinal: this.dates.end ,
      }

      this._service.loadGraficaOne(rangos).subscribe({
        next:(data:any)=>{





            data.forEach((item: any)=>{
                 this.lineChartLabels.push(item.tramite);
                 this.lineChartData[0].data.push(item.cantidad);
            })

            this.chart.update();
            this.chart?.render();

          },


        error:()=>{}
      })

     this._service.loadGraficaTwo(rangos).subscribe({
        next:(data)=>{

          data.forEach((item)=>{
               this.lineChartLabelTwo.push(item.estado);
               this.lineChartDataTwo[0].data.push(item.cantidad);
          })

          this.chart.update();
          this.chart?.render();

        },
        error:()=>{}
      })

       this._service.loadGraficaTree(rangos).subscribe({
        next:(data)=>{
          data.forEach((item)=>{

              //  this.lineChartLabelsTree.push(item.tramite);
               this.lineChartLabelsTree.push("");

               this.lineChartDatatree[0].data.push(item.tiempoGestion);
          })

          this.chart.update();
          this.chart?.render();

        },
        error:()=>{}
      })

      setTimeout(() => {
        this.stopLoading();
        if( this.lineChartLabelsTree.length>0){
          this.reloadGraficos = true;
        }else{
          this.reloadGraficos = false;
            const param = {
              icon: 'info',
              title: 'Info!',
              text:'No hay registros en el rango de fecha seleccionado'
            }
          this.alertError(param);
        }
      }, 1000);

    }



    public searchData(): void {
      console.log('searcjdata')

      this.startLoading({});

      this.borrar();

      if( !this.datesSearch.init || !this.datesSearch.end ){
        const param= {
          title: 'Info!',
          text:  "Por favor seleccione la fecha de inicio y fecha final para realizar la busqueda",
          icon: 'info',
        }
        this.alertError(param);
        return
      }

      if( this.datesSearch.init > this.datesSearch.end ){
        const param= {
          title: 'Info!',
          text:  "Por favor la fecha de inicio debe ser inferior a la  fecha final para realizar la busqueda",
          icon: 'info',
        }
        this.alertError(param);
        return
      }

      const rangos = {
        fechaInicial: this.datesSearch.init ,
        fechaFinal: this.datesSearch.end ,
      }

      this._service.searchData(rangos).subscribe({
        next:(resp)=>{
          if(!!resp.length){
            this.stopLoading();
            this.displayedColumns= Object.keys(this.encabezado);
            this.downloadExcelFile = resp
            this.dataSource =  new MatTableDataSource<any>([...resp]);
            this.dataSource.paginator = this.paginator;
          }else{
            const param= {
              title: 'Info!',
              text:  "Lo sentimos, no se encontraron registros en el rango de fechas seleccionada",
              icon: 'info',
            }
            this.alertError(param);
          }
        },
        error:()=>{
          this.alertError();
        }
      })







    }




}
