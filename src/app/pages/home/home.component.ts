import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AlumnosService } from 'src/app/services/alumnos.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  date: any;
  curp = new FormControl('', [Validators.minLength(18), Validators.required]);
  registro = new FormControl('', Validators.required);
  tiempoPermanencia = new FormControl('');
  uriFoto = "../../../assets/fotografias/";
  btnValidarRegistro:number;

  nombre:string;
  aPaterno:string;
  aMaterno:string;
  grupo:string;

  constructor(private alumnosService: AlumnosService) {
    this.countseconds();
    this.nombre = ''
    this.aPaterno = ''
    this.aMaterno = ''
    this.grupo = ''
    this.btnValidarRegistro = 0;
  }

  ngOnInit(): void {
    
  }

  countseconds() {
    setTimeout(() => {
      this.getTime();
      this.countseconds();
    }, 1000);
  }

  getTime() {
    this.date = moment().format('h:mm:ss a');
  }

  getAlumno() {
    if(this.curp.valid){
      this.alumnosService.getAlumnosByCurp(this.curp.value).subscribe((res:any) => {
        this.nombre = res[0][3];
        this.aPaterno = res[0][1];
        this.aMaterno = res[0][2];
        // this.grupo.setValue(res[]);
        this.validarREgistro();
  
      }, error => console.error(error));
    }else if(this.curp.value === null || this.curp.value === undefined ||this.curp.value === '' || !this.curp.valid ){
      this.initForm();
    }
  }

  initForm(){
    this.nombre = ''
    this.aPaterno = ''
    this.aMaterno = ''
    this.grupo = ''
    this.btnValidarRegistro = 0;
    this.registro.setValue('');
  }

  validarREgistro(){
    this.alumnosService.validarRegistro(this.curp.value).subscribe(res => {
      if(res === 1){
        this.btnValidarRegistro = 1;
      }else if(res === 2){
        this.btnValidarRegistro = 2;
      }
      
    }, error => console.error(error))
  }

  establecerAsistencia(){
    if(this.curp.valid && this.registro.valid){
      const timeActual = moment().format('DD/MM/YYYY,h:mm:ss a');
      if(this.btnValidarRegistro === 1){
        this.alumnosService.setEntrada(this.curp.value, timeActual, '0').subscribe( (res:any) => {
          this.initForm();
          this.curp.setValue('');
          this.alerta('Entrada registrada', 'success')
        }, error => {
          
          console.error(error)
          this.alerta('Error al registrar', 'error')
        })
      }else if(this.btnValidarRegistro === 2){
        this.alumnosService.setSalida(this.curp.value, '0' ,timeActual).subscribe( (res:any)=> {
          this.initForm();
          this.curp.setValue('');
          this.alerta('Salida registrada', 'success')
        }, error => {
          console.error(error)
          this.alerta('Error al registrar', 'error')
        })
      }
    }
  }

  alerta(title:any, icon:any){
    Swal.fire({
      position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 1500
    })
  }

}
