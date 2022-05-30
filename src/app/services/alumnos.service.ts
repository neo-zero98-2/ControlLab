import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {


  constructor(private http: HttpClient) {}
  
  getAlumnosByCurp(curp:string):Observable<any>{
    return this.http.get<any>(`http://localhost:3000/alumnos/${curp}`)
            .pipe(
              map(data => data)
            );
  }

  setEntrada(curp:string, hEntrada:string, hSalida:string): Observable<any>{
    return this.http.post("http://localhost:3000/alumnos",{curp, hEntrada, hSalida}, {responseType: 'text'})
          .pipe(
            map(data => data)
          )
  }

  validarRegistro(curp:string):Observable<any>{
    return this.http.get<any>(`http://localhost:3000/alumnos-validar-registro/${curp}`)
            .pipe(
              map(data => data)
            )
  }

  setSalida(curp:string, hEntrada:string, hSalida:string): Observable<any>{
    return this.http.put("http://localhost:3000/alumnos",{curp, hEntrada, hSalida}, {responseType: 'text'})
          .pipe(
            map(data => data)
          )
  }

  


  
}



