var express = require('express');
var router = express.Router();

const XLSX = require("xlsx");
const path = require('path');
var moment = require('moment');
const dirPath = path.join(__dirname, '/');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/alumnos/:curp', function (req, res) {
  const curp = req.params.curp;
  let respuesta;
  try {
    var wb = XLSX.readFile(path.join(__dirname, 'alumnos.xlsx'));
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    let alumnos = XLSX.utils.sheet_to_json(ws, { header: 1 })
    alumnos = alumnos.filter(alumn => alumn[5] === curp)
    respuesta = alumnos
  } catch (error) {
    respuesta = null
  }
  res.send(respuesta);
})

router.post('/alumnos', function (req, res) {

  const curp = req.body.curp;
  const hEntrada = req.body.hEntrada;
  const hSalida = req.body.hSalida;

  try {
    var wb = XLSX.readFile(path.join(__dirname, 'horarios.xlsx'));
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const horarios = XLSX.utils.sheet_to_json(ws, { header: 1 })

    horarios.push([curp, hEntrada, hSalida, 0]);
    console.log(horarios);

    const worksheet = XLSX.utils.aoa_to_sheet(horarios);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    XLSX.utils.sheet_add_aoa(worksheet, [["Curp", "Entrada", "Salida", "Permanencia"]], { origin: "A1" });
    XLSX.writeFile(workbook, path.join(__dirname, 'horarios.xlsx'));

  } catch (error) {
    const horarios = [
      { curp, hEntrada, hSalida, permanencia: 0 }
    ];
    const worksheet = XLSX.utils.json_to_sheet(horarios);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    XLSX.utils.sheet_add_aoa(worksheet, [["Curp", "Entrada", "Salida", "Permanencia"]], { origin: "A1" });
    XLSX.writeFile(workbook, path.join(__dirname, 'horarios.xlsx'));

    console.log('horarios creado');
  }

  res.send('Se proceso la respuesta');
})

router.put('/alumnos', (req, res) => {
  const curp = req.body.curp;
  const hEntrada = req.body.hEntrada;
  const hSalida = req.body.hSalida;

  let registro = obtenerUltimoHorario(curp);

  try {

    var wb = XLSX.readFile(path.join(__dirname, 'horarios.xlsx'));
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const horarios = XLSX.utils.sheet_to_json(ws, { header: 1 })

    console.log("Horario Anterior");
    console.log(horarios);

    horarios.map(horario => {
      if (horario[0] === registro[0] && horario[1] === registro[1] && horario[2] === registro[2]) {
        horario[2] = hSalida;

        const starFecha = moment(horario[1], 'DD/MM/YYYY,h:mm:ss a');
        const endFecha = moment(horario[2], 'DD/MM/YYYY,h:mm:ss a');
        const resta = endFecha.diff(starFecha);
        const diferencia = moment.duration(resta)

        horario[3] = `${diferencia.hours()} : ${diferencia.minutes()} : ${diferencia.seconds()}`
        return horario;
      } else {
        return horario;
      }
    });

    console.log("Nuevos Horarios");
    console.log(horarios);
    const worksheet = XLSX.utils.aoa_to_sheet(horarios);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    XLSX.utils.sheet_add_aoa(worksheet, [["Curp", "Entrada", "Salida", "Permanencia"]], { origin: "A1" });
    XLSX.writeFile(workbook, path.join(__dirname, 'horarios.xlsx'));

  } catch (error) {
    console.error(error);
  }

  res.send('se actualizo los datos');
})

router.get('/alumnos-validar-registro/:curp', (req, res) => {
  curp = req.params.curp;
  btnValidador = '1';
  ultimoRegistro = obtenerUltimoHorario(curp);
  if (ultimoRegistro === null) {
    btnValidador = '1';
  } else if (ultimoRegistro[2] == '0') {
    btnValidador = '2';
  } else if (ultimoRegistro[2] != '0') {
    btnValidador = '1';
  }
  res.send(btnValidador);
})


const obtenerUltimoHorario = (curp) => {

  try {
    var wb = XLSX.readFile(path.join(__dirname, 'horarios.xlsx'));
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const horarios = XLSX.utils.sheet_to_json(ws, { header: 1 })
    let result;
    const fechaActual = moment().format('DD/MM/YYYY');
    let listHorarios = horarios.map(res => {
      const array = res[1].split(',');
      if (array[0] === fechaActual) {
        return res;
      }
    })

    if (listHorarios.length === 0) {
      return null;
    } else {
      result = listHorarios.filter(horario => {
        if (horario) {
          return horario[0] === curp;
        }
      })
    }
    console.log(listHorarios);
    console.log(result);
    return result.length === 0 ? null : result[result.length - 1];
  } catch (error) {
    return null;
  }
}


module.exports = router;
