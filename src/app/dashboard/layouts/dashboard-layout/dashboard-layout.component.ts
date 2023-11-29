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


  /**
   * @description: actualiza el paginador caa vez que carga la informacion en la tabla con el metodo ngOnChanges
   */
  ngOnChanges(changes: SimpleChanges): void {this.dataSource.paginator = this.paginator;}


  /**
   * @description: metodo para cerrar session del usuario
   */
  public onLogout(): void {
    this.authService.logout();
  }

  /**
   * @description: metodo para asignar la ruta a visualizar y al cambiar limpia la data de las variables y de los graficos
   * @param ruta : recibe al ruta (ARCHIVO; HISTORICO; GRAFICA)
   */
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
  /**
   * @description:metodo que carga el archivo seleccionado de excel en  una variable
   * @param event : archivo seleccionado en formato de excel
   */
  public incomingfile(event: any): void{
  this.filedata= event.target.files[0];
  this.filedataCopy = event
  }

  /**
   * @description:metodo para iniciar el loading de la alerta
   * @param param: puede recibir texto a mostrar cuando se llama, es opcional
   */
  public startLoading({ title = 'Cargando', html = 'Por favor espere' }): void {
    Swal.fire({ title, html, allowOutsideClick: false, timer: 500000, didOpen: () => { Swal.showLoading() }, })
  }


  /**
   * @description: metodo para detener el loading de la alerta
   */
  public stopLoading(): void {Swal.close();}



  /**
   * @description: metodo para indicar una alerta se realizo la operacion de manera correcta
   */
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


  /**
   * @description: metodo para hacer click en el input que es de tipo "file", se invoca de esta manera debido a que el input esta oculto en el HTML
   */
  public loadArchivo(): void {const content2:HTMLElement= document.getElementById('fileinput') as HTMLElement;content2.click();}



  /**
   * @description:metodo que carga la data del excel en una variable y la convierte en JSON
   * @returns sino hay data retorna un alert y no continua con la ejecucion del codigo
   */
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
            this.dataJson.push({...row})});
            this.displayedColumns= Object.keys(this.encabezado);
            this.dataSource =  new MatTableDataSource<any>([...this.dataJson]);
            this.dataSource.paginator = this.paginator;
            this.guardarData([...this.dataJson]);
      }
      fileReader.readAsArrayBuffer(this.filedata);
    }


    /**
     * @description: metodo para descargar en formato EXCEL la data que se muestra en la tabla
     */
    public downloadExcel(): void {
      this.startLoading({});
      setTimeout(() => {
        this.exportAsExcelFile(this.downloadExcelFile,'Resumen consulta informe');
        this.stopLoading();
      }, 500);
    }



    /**
     * @description: este metodo se llama internamente para parsear el JSON a EXCEL
     */
    private exportAsExcelFile(json: any[], excelFileName: string): void {
      const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
      const myworkbook: XLSX.WorkBook = { Sheets: { 'data': myworksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
  }


    /**
     * @description: este metodo se llama internamente para convertir la variable en un archivo BLOB para que lo pueda descargar el navegador
     */
    private saveAsExcelFile(buffer: any, fileName: string): void {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName + ''+ EXCEL_EXTENSION);
  }



  /**
   * @description: funcion que se llama cada vez que cambia de ruta o se realiza una operacion para restablecer las variables que no tengan valor inicial
   */
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

    /**
     * @description: metodo que se ejecuta para filtrar la informacion de la tabla de historico
     * @param value: string que recibe el metodo para filtar la informacion de la tabla
     */
    public filtrarData(value : string): void {
      value = value?.trim()?.toUpperCase();
      this.dataSource.filter = value;
    }



    /**
     * @description: metodo que genera una alert de error cuando se realiza una solicitud
     * @param param: parametros para cambiar la informacion y opciones de la alerta
     */
  public alertError(param: any = {}): void {
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

    /**
     * @description: metodo que genera una alert de informacion cuando se realiza una solicitud
     * @param param: parametros para cambiar la informacion y opciones de la alerta
     */
  public alertInfo({ info = 'Lo sentimos, no se encontraron registros en la consulta' }): void {
    Swal.fire({
      allowOutsideClick: true,
      backdrop: true,
      text: info,
      icon: 'info',
      customClass: {
        confirmButton: 'rounded-full w-20 bg-gray-400 ring-0'
      }
    })
  }

    /**
     * @description: metodo ngAfterViewInit para actualizar el paginador de la tabla al momento de iniciar la vista
     *
     * */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

    /**
     * @description: metodo que guarda la data, consume la api para guardar los registros en la tabla
     * @param data: informacion que contiene la data del json para guardar en el backend
     * */
    public guardarData(data: any): void {
      this._service.guardarData(data).subscribe({
        next:(resp)=>{
          this.alertSuccess();
          this.json = null
          this.dataJson = null
          this.filedata = null
          this.fileinput.nativeElement.value = '';
        },
        error:()=>{
          this.alertError();
        }
      })
    }


  /**
    * @description: metodo para cargar la data de los graficos, cada vez que se llama se limpia los valores de las variables y se renderizan los graficos
    *
    **/
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
        const info = "Por favor seleccione la fecha de inicio y fecha final para realizar la busqueda"
        this.alertInfo({info});
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




    /**
     * @description: metodo para filtrar la data que se desea consultar en la tabla de historico
     *
     * */
    public searchData(): void {
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
