import React, { useState } from "react";
import styles from "./step2Vehicle.module.css";
import { vehiclesApi } from "../../../../services/vehicles.api";

const VehicleForm = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  tipoPlaca,
  onTipoPlacaChange,
}) => {
  const [errors, setErrors] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    chassis: "",
    engine: "",
    mileage: "",
    fuel_type: "",
    scraping: "",
  });

  const [scrapingLoading, setScrapingLoading] = useState(false);

  // Función para obtener solo la parte antes del guión del tipo de placa
  const getTipoPlacaPrefix = (tipoPlacaValue) => {
  // Lista de tipos que NO deben tener prefijo
  const noPrefixTypes = ['PARTICULAR', ' - PARTICULAR'];
  
  if (noPrefixTypes.includes(tipoPlacaValue.trim())) {
    return '';
  }
  
  const parts = tipoPlacaValue.split('-');
  return parts.length > 1 ? parts[0].trim() + '-' : tipoPlacaValue.trim() + '-';
};

  // Función para formatear la placa completa
  const formatPlate = (plateNumber) => {
    const prefix = getTipoPlacaPrefix(tipoPlaca);
    return prefix + plateNumber;
  };

  const tiposPlaca = [
    { value: " - PARTICULAR", label: " - PARTICULAR" },
    {
      value: "TAP-AEROPUERTO INTERNACIONAL JUAN SANTAMARIA",
      label: "TAP-AEROPUERTO INTERNACIONAL JUAN SANTAMARIA",
    },
    {
      value: "352-AGENCIA DE PROTECCION DE DATOS DE LOS HABITANTES",
      label: "352-AGENCIA DE PROTECCION DE DATOS DE LOS HABITANTES",
    },
    { value: "AB-ALAJUELA BUS", label: "AB-ALAJUELA BUS" },
    { value: "AP-ALAJUELA PUBLICO", label: "AP-ALAJUELA PUBLICO" },
    { value: "AL-ASAMBLEA LEGISLATIVA", label: "AL-ASAMBLEA LEGISLATIVA" },
    { value: "PEB-ASAMBLEA LEGISLATIVA", label: "PEB-ASAMBLEA LEGISLATIVA" },
    { value: "339-ASAMBLEA LEGISLATIVA.", label: "339-ASAMBLEA LEGISLATIVA." },
    {
      value:
        "316-ASOCIACION DE CONSERVACION Y DESARROLLO FORESTAL DE TALAMANCA",
      label:
        "316-ASOCIACION DE CONSERVACION Y DESARROLLO FORESTAL DE TALAMANCA",
    },
    {
      value: "297-AUTORIDAD REGULADORA DE LOS SERVICIOS PUBLICOS",
      label: "297-AUTORIDAD REGULADORA DE LOS SERVICIOS PUBLICOS",
    },
    {
      value: "051-BANCO ANGLO COSTARRRICENSE",
      label: "051-BANCO ANGLO COSTARRRICENSE",
    },
    {
      value: "052-BANCO CENTRAL DE COSTA RICA",
      label: "052-BANCO CENTRAL DE COSTA RICA",
    },
    {
      value: "053-BANCO CREDITO AGRICOLA DE CARTAGO",
      label: "053-BANCO CREDITO AGRICOLA DE CARTAGO",
    },
    { value: "054-BANCO DE COSTA RICA", label: "054-BANCO DE COSTA RICA" },
    {
      value: "305-BANCO HIPOTECARIO DE LA VIVIENDA",
      label: "305-BANCO HIPOTECARIO DE LA VIVIENDA",
    },
    {
      value: "055-BANCO NACIONAL DE COSTA RICA",
      label: "055-BANCO NACIONAL DE COSTA RICA",
    },
    {
      value: "056-BANCO POPULAR Y DE DESARROLLO COMUNAL",
      label: "056-BANCO POPULAR Y DE DESARROLLO COMUNAL",
    },
    { value: "BTA-BICICLETA", label: "BTA-BICICLETA" },
    { value: "BM-BICIMOTO", label: "BM-BICIMOTO" },
    {
      value: "200-CAJA COSTARRICENSE DEL SEGURO SOCIAL",
      label: "200-CAJA COSTARRICENSE DEL SEGURO SOCIAL",
    },
    { value: "CL-CARGA LIVIANA", label: "CL-CARGA LIVIANA" },
    { value: "C-CARGA PESADA", label: "C-CARGA PESADA" },
    { value: "CB-CARTAGO BUS", label: "CB-CARTAGO BUS" },
    { value: "CP-CARTAGO PUBLICO", label: "CP-CARTAGO PUBLICO" },
    {
      value: "325-CENTRO COSTARRICENSE DE PRODUCCION CINEMATOGRAFICA",
      label: "325-CENTRO COSTARRICENSE DE PRODUCCION CINEMATOGRAFICA",
    },
    {
      value: "327-CENTRO CULTURAL E HISTORICO JOSE FIGUERES FERRER",
      label: "327-CENTRO CULTURAL E HISTORICO JOSE FIGUERES FERRER",
    },
    {
      value: "326-CENTRO NACIONAL DE LA MUSICA",
      label: "326-CENTRO NACIONAL DE LA MUSICA",
    },
    { value: "111-CLUBES 4 - S", label: "111-CLUBES 4 - S" },
    {
      value: "311-COLEGIO UNIVERSITARIO DE ALAJUELA",
      label: "311-COLEGIO UNIVERSITARIO DE ALAJUELA",
    },
    {
      value: "01-COLEGIO UNIVERSITARIO DE CARTAGO",
      label: "01-COLEGIO UNIVERSITARIO DE CARTAGO",
    },
    {
      value: "COL-COLEGIO UNIVERSITARIO DE CARTAGO",
      label: "COL-COLEGIO UNIVERSITARIO DE CARTAGO",
    },
    {
      value: "314-COLEGIO UNIVERSITARIO DE CARTAGO",
      label: "314-COLEGIO UNIVERSITARIO DE CARTAGO",
    },
    {
      value: "319-COLEGIO UNIVERSITARIO DE LIMON",
      label: "319-COLEGIO UNIVERSITARIO DE LIMON",
    },
    {
      value: "312-COLEGIO UNIVERSITARIO DE PUNTARENAS",
      label: "312-COLEGIO UNIVERSITARIO DE PUNTARENAS",
    },
    {
      value:
        "298-COLEGIO UNIVERSITARIO PARA EL RIESGO Y EL DESARROLLO DEL TROPICO",
      label:
        "298-COLEGIO UNIVERSITARIO PARA EL RIESGO Y EL DESARROLLO DEL TROPICO",
    },
    {
      value: "238-COM.NAC.INVESTIGACION CIEN. Y TEC.",
      label: "238-COM.NAC.INVESTIGACION CIEN. Y TEC.",
    },
    {
      value: "303-COMISION DE ENERGIA ATOMICA DE C.R.",
      label: "303-COMISION DE ENERGIA ATOMICA DE C.R.",
    },
    {
      value: "233-COMISION NACIONAL DE ASUNTOS INDIGENAS",
      label: "233-COMISION NACIONAL DE ASUNTOS INDIGENAS",
    },
    {
      value: "057-COMISION NACIONAL DE PRESTAMOS PARA LA EDUCACION",
      label: "057-COMISION NACIONAL DE PRESTAMOS PARA LA EDUCACION",
    },
    {
      value:
        "322-COMISION NACIONAL DE PREVENCION DE RIESGOS Y ATENCION EMERGENCIAS",
      label:
        "322-COMISION NACIONAL DE PREVENCION DE RIESGOS Y ATENCION EMERGENCIAS",
    },
    {
      value:
        "351-COMISION PARA EL ORDENAMIENTO Y MANEJO DE LA CUENCA DEL RIO REVENTAZON",
      label:
        "351-COMISION PARA EL ORDENAMIENTO Y MANEJO DE LA CUENCA DEL RIO REVENTAZON",
    },
    {
      value:
        "353-COMISIÓN NACIONAL PARA LA GESTION DE LA BIODIVERSIDAD (CONAGEBIO)",
      label:
        "353-COMISIÓN NACIONAL PARA LA GESTION DE LA BIODIVERSIDAD (CONAGEBIO)",
    },
    {
      value: "107-COMPAÑIA NACIONAL DE FUERZA Y LUZ",
      label: "107-COMPAÑIA NACIONAL DE FUERZA Y LUZ",
    },
    {
      value: "CNF-COMPAÑIA NACIONAL DE FUERZA Y LUZ",
      label: "CNF-COMPAÑIA NACIONAL DE FUERZA Y LUZ",
    },
    {
      value: "012-CONCESIONARIO DE OBRA PUBLICA",
      label: "012-CONCESIONARIO DE OBRA PUBLICA",
    },
    {
      value: "344-CONSEJO DE SALUD OCUPACIONAL",
      label: "344-CONSEJO DE SALUD OCUPACIONAL",
    },
    {
      value: "260-CONSEJO DE SEGURIDAD VIAL",
      label: "260-CONSEJO DE SEGURIDAD VIAL",
    },
    {
      value: "318-CONSEJO DE TRANSPORTE PUBLICO",
      label: "318-CONSEJO DE TRANSPORTE PUBLICO",
    },
    {
      value: "323-CONSEJO NACIONAL DE CONCESIONES",
      label: "323-CONSEJO NACIONAL DE CONCESIONES",
    },
    {
      value: "328-CONSEJO NACIONAL DE LA POLITICA PUBLICA DE LA PERSONA JOVEN",
      label: "328-CONSEJO NACIONAL DE LA POLITICA PUBLICA DE LA PERSONA JOVEN",
    },
    {
      value: "240-CONSEJO NACIONAL DE PERSONAS CON DISCAPACIDAD (CONAPDIS)",
      label: "240-CONSEJO NACIONAL DE PERSONAS CON DISCAPACIDAD (CONAPDIS)",
    },
    {
      value: "100-CONSEJO NACIONAL DE PRODUCCION",
      label: "100-CONSEJO NACIONAL DE PRODUCCION",
    },
    {
      value: "239-CONSEJO NACIONAL DE RECTORES",
      label: "239-CONSEJO NACIONAL DE RECTORES",
    },
    {
      value: "CGR-CONTRALORIA GENERAL DE LA REPUBLICA",
      label: "CGR-CONTRALORIA GENERAL DE LA REPUBLICA",
    },
    {
      value: "309-CONTRATOS ACUEDUCTOS Y ALCANTARILLADO",
      label: "309-CONTRATOS ACUEDUCTOS Y ALCANTARILLADO",
    },
    {
      value: "306-CONTRATOS COMISION NAC. EMERGENCIA",
      label: "306-CONTRATOS COMISION NAC. EMERGENCIA",
    },
    { value: "CRC-CRUZ ROJA", label: "CRC-CRUZ ROJA" },
    { value: "CC-CUERPO CONSULAR", label: "CC-CUERPO CONSULAR" },
    {
      value: "341-CUERPO DE BOMBEROS DE COSTA RICA",
      label: "341-CUERPO DE BOMBEROS DE COSTA RICA",
    },
    { value: "CD-CUERPO DIPLOMATICO", label: "CD-CUERPO DIPLOMATICO" },
    {
      value: "D H-DEFENSORIA DE LOS HABITANTES DE LA REPUBLICA",
      label: "D H-DEFENSORIA DE LOS HABITANTES DE LA REPUBLICA",
    },
    {
      value: "349-DIRECCION NACIONAL DE NOTARIADO",
      label: "349-DIRECCION NACIONAL DE NOTARIADO",
    },
    { value: "252-EDITORIAL COSTA RICA", label: "252-EDITORIAL COSTA RICA" },
    {
      value: "EMB-EMBAJADA DE LA REPUBLICA CHECA",
      label: "EMB-EMBAJADA DE LA REPUBLICA CHECA",
    },
    { value: "12-EMPRESA CONSTRUCTORA", label: "12-EMPRESA CONSTRUCTORA" },
    {
      value: "101-EMPRESA DE SERVICIOS PUBLICOS DE HEREDIA",
      label: "101-EMPRESA DE SERVICIOS PUBLICOS DE HEREDIA",
    },
    { value: "EE-EQUIPO ESPECIAL", label: "EE-EQUIPO ESPECIAL" },
    {
      value: "302-ESCUELA CENTROAMERICANA DE GANADERIA",
      label: "302-ESCUELA CENTROAMERICANA DE GANADERIA",
    },
    {
      value: "USA-ESTADOS UNIDOS DE AMERICA",
      label: "USA-ESTADOS UNIDOS DE AMERICA",
    },
    { value: "EXP-EXPORTACION", label: "EXP-EXPORTACION" },
    {
      value: "355-FONDO DE NACIONAL DE FINANCIAMIENTO FORESTAL (FONAFIFO)",
      label: "355-FONDO DE NACIONAL DE FINANCIAMIENTO FORESTAL (FONAFIFO)",
    },
    {
      value: "350-FONDO NACIONAL DE BECAS",
      label: "350-FONDO NACIONAL DE BECAS",
    },
    {
      value:
        "329-FUNDACION AYUDANOS PARA AYUDAR (CENTRO COSTARRICENSE DE LA CIENCIA Y LA CULTURA)",
      label:
        "329-FUNDACION AYUDANOS PARA AYUDAR (CENTRO COSTARRICENSE DE LA CIENCIA Y LA CULTURA)",
    },
    {
      value: "MI4-FUNDACION CONSEJO DE LA TIERRA",
      label: "MI4-FUNDACION CONSEJO DE LA TIERRA",
    },
    {
      value: "FUN-FUNDACION FRIEDRICH EBERT",
      label: "FUN-FUNDACION FRIEDRICH EBERT",
    },
    { value: "GB-GUANACASTE BUS", label: "GB-GUANACASTE BUS" },
    { value: "GP-GUANACASTE PUBLICO", label: "GP-GUANACASTE PUBLICO" },
    { value: "HB-HEREDIA BUS", label: "HB-HEREDIA BUS" },
    { value: "HP-HEREDIA PUBLICO", label: "HP-HEREDIA PUBLICO" },
    { value: "264-I.N.S.A.", label: "264-I.N.S.A." },
    { value: "259-ILLANUT", label: "259-ILLANUT" },
    { value: "250-IMPRENTA NACIONAL", label: "250-IMPRENTA NACIONAL" },
    { value: "317-INAMU", label: "317-INAMU" },
    {
      value: "110-INS. COSTARRICENSE DE FERROCARRILES",
      label: "110-INS. COSTARRICENSE DE FERROCARRILES",
    },
    {
      value: "257-INS. COSTARRICENSE DE TURISMO",
      label: "257-INS. COSTARRICENSE DE TURISMO",
    },
    {
      value: "261-INS. MIXTO DE AYUDA SOCIAL",
      label: "261-INS. MIXTO DE AYUDA SOCIAL",
    },
    {
      value: "262-INS. NACIONAL DE APRENDIZAJE",
      label: "262-INS. NACIONAL DE APRENDIZAJE",
    },
    {
      value: "265-INS. TECNOLOGICO DE COSTA RICA",
      label: "265-INS. TECNOLOGICO DE COSTA RICA",
    },
    {
      value: "258-INST.GEOGRAFICO NACIONAL",
      label: "258-INST.GEOGRAFICO NACIONAL",
    },
    {
      value: "INC-INSTITUTO COSTARRICENES DE PESCA Y ACUACULTURA",
      label: "INC-INSTITUTO COSTARRICENES DE PESCA Y ACUACULTURA",
    },
    {
      value: "003-INSTITUTO COSTARRICENSE CONTRA EL CANCER",
      label: "003-INSTITUTO COSTARRICENSE CONTRA EL CANCER",
    },
    {
      value: "102-INSTITUTO COSTARRICENSE DE ACUEDUCTOS Y ALCATARILLADOS",
      label: "102-INSTITUTO COSTARRICENSE DE ACUEDUCTOS Y ALCATARILLADOS",
    },
    {
      value: "103-INSTITUTO COSTARRICENSE DE ELECTRICIDAD",
      label: "103-INSTITUTO COSTARRICENSE DE ELECTRICIDAD",
    },
    {
      value:
        "256-INSTITUTO COSTARRICENSE DE INVESTIGACION Y ENSEÑANZA EN NUTRICION Y SALUD",
      label:
        "256-INSTITUTO COSTARRICENSE DE INVESTIGACION Y ENSEÑANZA EN NUTRICION Y SALUD",
    },
    {
      value: "313-INSTITUTO COSTARRICENSE DE PESCA Y ACUACULTURA",
      label: "313-INSTITUTO COSTARRICENSE DE PESCA Y ACUACULTURA",
    },
    {
      value: "263-INSTITUTO DE DESARROLLO AGRARIO",
      label: "263-INSTITUTO DE DESARROLLO AGRARIO",
    },
    {
      value: "059-INSTITUTO DE FOMENTO Y ASESORIA MUNICIPAL",
      label: "059-INSTITUTO DE FOMENTO Y ASESORIA MUNICIPAL",
    },
    {
      value: "104-INSTITUTO DE PUERTOS DEL PACIFICO",
      label: "104-INSTITUTO DE PUERTOS DEL PACIFICO",
    },
    {
      value: "IAG-INSTITUTO GEODESICO AMERICANO",
      label: "IAG-INSTITUTO GEODESICO AMERICANO",
    },
    {
      value: "113-INSTITUTO NACIONAL DE ESTADISTICA Y CENSOS",
      label: "113-INSTITUTO NACIONAL DE ESTADISTICA Y CENSOS",
    },
    {
      value: "060-INSTITUTO NACIONAL DE FOMENTO",
      label: "060-INSTITUTO NACIONAL DE FOMENTO",
    },
    {
      value:
        "346-INSTITUTO NACIONAL DE INNOVACION Y TRANSFERENCIA EN TECNOLOGIA AGROPECUARIA",
      label:
        "346-INSTITUTO NACIONAL DE INNOVACION Y TRANSFERENCIA EN TECNOLOGIA AGROPECUARIA",
    },
    {
      value: "061-INSTITUTO NACIONAL DE SEGUROS",
      label: "061-INSTITUTO NACIONAL DE SEGUROS",
    },
    {
      value: "105-INSTITUTO NACIONAL DE VIVIENDA Y URBANISMO",
      label: "105-INSTITUTO NACIONAL DE VIVIENDA Y URBANISMO",
    },
    {
      value: "109-JUN.ADM.PUER.DES.ECON. VERT.ATLANTICA",
      label: "109-JUN.ADM.PUER.DES.ECON. VERT.ATLANTICA",
    },
    {
      value: "268-JUNTA ADM. DIR. NAC. DE COMUNICACIONES S",
      label: "268-JUNTA ADM. DIR. NAC. DE COMUNICACIONES S",
    },
    {
      value: "331-JUNTA ADMINISTRATIVA ARCHIVO NACIONAL",
      label: "331-JUNTA ADMINISTRATIVA ARCHIVO NACIONAL",
    },
    {
      value: "108-JUNTA ADMINISTRATIVA DE SERVICIOS ELECTRICOS DE CARTAGO",
      label: "108-JUNTA ADMINISTRATIVA DE SERVICIOS ELECTRICOS DE CARTAGO",
    },
    {
      value: "332-JUNTA ADMINISTRATIVA DEL MUSEO HISTORICO JUAN SANTAMARIA",
      label: "332-JUNTA ADMINISTRATIVA DEL MUSEO HISTORICO JUAN SANTAMARIA",
    },
    {
      value: "310-JUNTA ADMINISTRATIVA REGISTRO NACIONAL",
      label: "310-JUNTA ADMINISTRATIVA REGISTRO NACIONAL",
    },
    {
      value: "333-JUNTA ADMINISTRATIVA TEATRO MELICO SALAZAR",
      label: "333-JUNTA ADMINISTRATIVA TEATRO MELICO SALAZAR",
    },
    {
      value: "315-JUNTA ADMINISTRATIVA TEATRO NACIONAL",
      label: "315-JUNTA ADMINISTRATIVA TEATRO NACIONAL",
    },
    {
      value: "330-JUNTA ADMINISTRATIVA TEATRO NACIONAL",
      label: "330-JUNTA ADMINISTRATIVA TEATRO NACIONAL",
    },
    {
      value: "273-JUNTA DE PEN. Y JUB. MAGISTERIO NACIONAL",
      label: "273-JUNTA DE PEN. Y JUB. MAGISTERIO NACIONAL",
    },
    {
      value: "276-JUNTA PROTEC.SOCIAL SAN JOSE",
      label: "276-JUNTA PROTEC.SOCIAL SAN JOSE",
    },
    {
      value: "277-JUNTA PROTEC.SOCIAL SAN RAMON",
      label: "277-JUNTA PROTEC.SOCIAL SAN RAMON",
    },
    {
      value: "LFP-LIMITACIONES FISICAS PERMANENTES",
      label: "LFP-LIMITACIONES FISICAS PERMANENTES",
    },
    { value: "LB-LIMON BUS", label: "LB-LIMON BUS" },
    { value: "LP-LIMON PUBLICO", label: "LP-LIMON PUBLICO" },
    { value: "MD-MISION DIPLOMATICA", label: "MD-MISION DIPLOMATICA" },
    { value: "MI-MISION INTERNACIONAL", label: "MI-MISION INTERNACIONAL" },
    { value: "MOT-MOTOCICLETAS", label: "MOT-MOTOCICLETAS" },
    {
      value: "MF-MUNDIAL DE FUTBOL FEMENINO 2014",
      label: "MF-MUNDIAL DE FUTBOL FEMENINO 2014",
    },
    {
      value: "335-MUSEO DE ARTE COSTARRICENSE",
      label: "335-MUSEO DE ARTE COSTARRICENSE",
    },
    {
      value: "336-MUSEO DE ARTE Y DISEÑO CONTEMPORANEO",
      label: "336-MUSEO DE ARTE Y DISEÑO CONTEMPORANEO",
    },
    { value: "253-MUSEO NACIONAL", label: "253-MUSEO NACIONAL" },
    {
      value: "337-MUSEO RAFAEL ANGEL CALDERON GUARDIA",
      label: "337-MUSEO RAFAEL ANGEL CALDERON GUARDIA",
    },
    {
      value: "002-MUTUALES DE AHORRO Y PRESTAMO",
      label: "002-MUTUALES DE AHORRO Y PRESTAMO",
    },
    { value: "OP-OBRA PUBLICA", label: "OP-OBRA PUBLICA" },
    { value: "285-OFICINA DEL ARROZ", label: "285-OFICINA DEL ARROZ" },
    { value: "284-OFICINA DEL CAFE", label: "284-OFICINA DEL CAFE" },
    {
      value: "286-OFICINA NACIONAL DE SEMILLAS",
      label: "286-OFICINA NACIONAL DE SEMILLAS",
    },
    {
      value: "290-PATRONATO NACIONAL DE LA INFANCIA",
      label: "290-PATRONATO NACIONAL DE LA INFANCIA",
    },
    {
      value: "292-PATRONATO NACIONAL DE REHABILITACION",
      label: "292-PATRONATO NACIONAL DE REHABILITACION",
    },
    { value: "PEN-PENSIONADO", label: "PEN-PENSIONADO" },
    { value: "TAX-PERMISOS DE TAXI", label: "TAX-PERMISOS DE TAXI" },
    { value: "PE-PODER EJECUTIVO", label: "PE-PODER EJECUTIVO" },
    { value: "PJ-PODER JUDICIAL", label: "PJ-PODER JUDICIAL" },
    {
      value: "112-PROGRAMA INTEGRAL DE MERCADEO AGROPECUARIO (PIMA)",
      label: "112-PROGRAMA INTEGRAL DE MERCADEO AGROPECUARIO (PIMA)",
    },
    { value: "PB-PUNTARENAS BUS", label: "PB-PUNTARENAS BUS" },
    { value: "PP-PUNTARENAS PUBLICO", label: "PP-PUNTARENAS PUBLICO" },
    {
      value: "106-RADIOGRAFICA COSTARRICENSE S.A.",
      label: "106-RADIOGRAFICA COSTARRICENSE S.A.",
    },
    {
      value: "308-REFINADORA COSTARRICENSE DE PETROLEO (RECOPE)",
      label: "308-REFINADORA COSTARRICENSE DE PETROLEO (RECOPE)",
    },
    { value: "RL-REMOLQUE LIVIANO", label: "RL-REMOLQUE LIVIANO" },
    { value: "R-REMOLQUES", label: "R-REMOLQUES" },
    { value: "296-S.E.N.A.R.A.", label: "296-S.E.N.A.R.A." },
    { value: "SJB-SAN JOSE BUS", label: "SJB-SAN JOSE BUS" },
    { value: "SJP-SAN JOSE PUBLICO", label: "SJP-SAN JOSE PUBLICO" },
    { value: "S-SEMIREMOLQUE", label: "S-SEMIREMOLQUE" },
    { value: "SE-SERVICIO ESTABLE", label: "SE-SERVICIO ESTABLE" },
    {
      value: "342-SERVICIO FITOSANITARIO DEL ESTADO",
      label: "342-SERVICIO FITOSANITARIO DEL ESTADO",
    },
    { value: "SM-SERVICIO MUNICIPAL", label: "SM-SERVICIO MUNICIPAL" },
    {
      value: "340-SERVICIO NACIONAL DE SALUD ANIMAL",
      label: "340-SERVICIO NACIONAL DE SALUD ANIMAL",
    },
    { value: "SR-SERVICIO REMOLQUE", label: "SR-SERVICIO REMOLQUE" },
    {
      value: "348-SISTEMA DE BANCA PARA EL DESARROLLO",
      label: "348-SISTEMA DE BANCA PARA EL DESARROLLO",
    },
    {
      value: "324-SISTEMA DE EMERGENCIAS 911",
      label: "324-SISTEMA DE EMERGENCIAS 911",
    },
    {
      value: "347-SISTEMA NACIONAL DE AREAS DE CONSERVACION",
      label: "347-SISTEMA NACIONAL DE AREAS DE CONSERVACION",
    },
    {
      value: "338-SISTEMA NACIONAL DE RADIO Y TELEVISION S.A. (SINART S.A.)",
      label: "338-SISTEMA NACIONAL DE RADIO Y TELEVISION S.A. (SINART S.A.)",
    },
    {
      value: "345-SUPERINTENDENCIA DE TELECOMUNICACIONES (SUTEL)",
      label: "345-SUPERINTENDENCIA DE TELECOMUNICACIONES (SUTEL)",
    },
    { value: "TA-TAXI DE ALAJUELA", label: "TA-TAXI DE ALAJUELA" },
    { value: "TC-TAXI DE CARTAGO", label: "TC-TAXI DE CARTAGO" },
    { value: "TG-TAXI DE GUANACASTE", label: "TG-TAXI DE GUANACASTE" },
    { value: "TH-TAXI DE HEREDIA", label: "TH-TAXI DE HEREDIA" },
    { value: "TL-TAXI DE LIMON", label: "TL-TAXI DE LIMON" },
    { value: "TP-TAXI DE PUNTARENAS", label: "TP-TAXI DE PUNTARENAS" },
    { value: "TSJ-TAXI DE SAN JOSE", label: "TSJ-TAXI DE SAN JOSE" },
    { value: "TE-TAXI ESTABLE", label: "TE-TAXI ESTABLE" },
    {
      value: "321-TRIBUNAL ADMINISTRATIVO DE TRANSPORTES",
      label: "321-TRIBUNAL ADMINISTRATIVO DE TRANSPORTES",
    },
    {
      value: "320-TRIBUNAL REGISTRAL ADMINISTRATIVO",
      label: "320-TRIBUNAL REGISTRAL ADMINISTRATIVO",
    },
    {
      value: "TSE-TRIBUNAL SUPREMO DE ELECCIONES",
      label: "TSE-TRIBUNAL SUPREMO DE ELECCIONES",
    },
    { value: "TUR-TURISMO", label: "TUR-TURISMO" },
    { value: "301-UNIVERSIDA NACIONAL", label: "301-UNIVERSIDA NACIONAL" },
    {
      value: "307-UNIVERSIDAD ADVENTISTA DE CENTRO AMERICA",
      label: "307-UNIVERSIDAD ADVENTISTA DE CENTRO AMERICA",
    },
    {
      value: "299-UNIVERSIDAD DE COSTA RICA",
      label: "299-UNIVERSIDAD DE COSTA RICA",
    },
    {
      value: "300-UNIVERSIDAD ESTATAL A DISTANCIA",
      label: "300-UNIVERSIDAD ESTATAL A DISTANCIA",
    },
    {
      value: "343-UNIVERSIDAD TECNICA NACIONAL",
      label: "343-UNIVERSIDAD TECNICA NACIONAL",
    },
    { value: "VE-VEHICULO ESPECIAL", label: "VE-VEHICULO ESPECIAL" },
    { value: "VH-VEHICULO HISTORICO", label: "VH-VEHICULO HISTORICO" },
    {
      value: "D-VEHICULOS DISCAPACITADOS",
      label: "D-VEHICULOS DISCAPACITADOS",
    },
    {
      value: "ZFE-ZONAS FRANCAS DE EXPORTACION",
      label: "ZFE-ZONAS FRANCAS DE EXPORTACION",
    },
  ];
  const validateForm = () => {
    const newErrors = {
      plate: "",
      brand: "",
      model: "",
      year: "",
      chassis: "",
      engine: "",
      mileage: "",
      fuel_type: "",
      scraping: "",
    };

    let isValid = true;

    if (!formData.plate.trim()) {
      newErrors.plate = "La placa es requerida";
      isValid = false;
    } else if (formData.plate.length > 6) {
      newErrors.plate = "Máximo 6 caracteres permitidos";
      isValid = false;
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "La marca es requerida";
      isValid = false;
    } else if (formData.brand.length > 255) {
      newErrors.brand = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.model.trim()) {
      newErrors.model = "El modelo es requerido";
      isValid = false;
    } else if (formData.model.length > 255) {
      newErrors.model = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.year) {
      newErrors.year = "El año es requerido";
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(formData.year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = `Ingrese un año válido (1900-${currentYear + 1})`;
        isValid = false;
      }
    }

    if (!formData.chassis.trim()) {
      newErrors.chassis = "El chasis es requerido";
      isValid = false;
    } else if (formData.chassis.length > 255) {
      newErrors.chassis = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.engine.trim()) {
      newErrors.engine = "El motor es requerido";
      isValid = false;
    } else if (formData.engine.length > 255) {
      newErrors.engine = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.mileage && formData.mileage !== 0) {
      newErrors.mileage = "El kilometraje es requerido";
      isValid = false;
    } else {
      const mileageNum = parseInt(formData.mileage);
      if (isNaN(mileageNum)) {
        newErrors.mileage = "Debe ser un número";
        isValid = false;
      } else if (mileageNum < 0 || mileageNum > 2000000) {
        newErrors.mileage = "No puede ser negativo o mayor a 2,000,000";
        isValid = false;
      }
    }
    if (!formData.fuel_type) {
      newErrors.fuel_type = "El tipo de combustible es requerido";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleScraping = async () => {
    if (!formData.plate.trim()) {
      setErrors((prev) => ({ ...prev, scraping: "Ingrese la placa primero" }));
      return;
    }

    setScrapingLoading(true);
    setErrors((prev) => ({ ...prev, scraping: "" }));

    try {

      // Formatear la placa completa para el scraping
      const plateForScraping = formatPlate(formData.plate);

      const response = await vehiclesApi.scrapeVehicleData(
        formData.plate,
        tipoPlaca
      );

      if (response?.success) {
        const {
          brand,
          model,
          year,
          chassis,
          engine,
          traccion,
          combustible,
          color,
          cilindros,
          nombre,
          carroceria,
          categoria,
          vin,
        } = response.data;

        // Mapear combustible del scraping al formato de fuel_type
        const fuelTypeMap = {
          GASOLINA: "Gasolina",
          DIESEL: "Diesel",
          ELECTRICO: "Electrico",
          HIBRIDO: "Hibrido",
          GAS: "Gas",
        };

        onInputChange({ target: { name: "brand", value: brand || "" } });
        onInputChange({ target: { name: "model", value: model || "" } });
        onInputChange({ target: { name: "year", value: year || "" } });
        onInputChange({ target: { name: "chassis", value: chassis || "" } });
        onInputChange({ target: { name: "engine", value: engine || "" } });
        onInputChange({ target: { name: "traccion", value: traccion || "" } });
        onInputChange({
          target: {
            name: "fuel_type",
            value: fuelTypeMap[combustible?.toUpperCase()] || "Gasolina",
          },
        });
        onInputChange({ target: { name: "color", value: color || "" } });
        onInputChange({
          target: { name: "cilindros", value: cilindros || "" },
        });
        onInputChange({
          target: { name: "nombre_propietario", value: nombre || "" },
        });
        onInputChange({
          target: { name: "carroceria", value: carroceria || "" },
        });
        onInputChange({
          target: { name: "categoria", value: categoria || "" },
        });
        onInputChange({ target: { name: "vin", value: vin || "" } });

        setErrors((prev) => ({
          ...prev,
          scraping: "✓ Datos obtenidos correctamente",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          scraping:
            response?.message || "No se encontraron datos para esta placa",
        }));
      }
    } catch (error) {
      console.error("Error en scraping:", error);
      setErrors((prev) => ({
        ...prev,
        scraping: error.message || "Error al consultar el registro nacional",
      }));
    } finally {
      setScrapingLoading(false);
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    // Determinar si necesitamos formatear la placa o no
    const cleanedTipoPlaca = tipoPlaca.replace(/^\s*-\s*/, '').trim();
    const noPrefixTypes = ["PARTICULAR"];
    
    let finalPlate = formData.plate;
    
    // Solo formatear si NO es PARTICULAR
    if (!noPrefixTypes.includes(cleanedTipoPlaca)) {
      finalPlate = formatPlate(formData.plate);
    }
    
    const formattedFormData = {
      ...formData,
      plate: finalPlate
    };
    onSubmit(formattedFormData);
  }
};

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    let limitedValue = numericValue;
    if (limitedValue !== "") {
      const num = parseInt(limitedValue, 10);
      if (num > 2000000) limitedValue = "2000000";
    }
    onInputChange({ target: { name, value: limitedValue } });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.vehicleForm}>
      <div className={styles.scrapingSection}>
        <h4>Consultar datos del Registro Nacional</h4>
        <div className={styles.scrapingForm}>
          <div className={styles.formGroup}>
            <label>Tipo de placa*</label>
            <select
              value={tipoPlaca}
              onChange={(e) => onTipoPlacaChange(e.target.value)}
              disabled={scrapingLoading || loading}
              className={styles.scrapingSelect}
            >
              {tiposPlaca.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleScraping}
            disabled={scrapingLoading || loading || !formData.plate.trim()}
            className={styles.scrapingButton}
          >
            {scrapingLoading ? "Consultando..." : "Consultar Datos"}
          </button>
        </div>
        {errors.scraping && (
          <p
            className={
              errors.scraping.includes("✓")
                ? styles.successText
                : styles.errorText
            }
          >
            {errors.scraping}
          </p>
        )}
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Placa*</label>
          <input
            type="text"
            name="plate"
            value={formData.plate}
            onChange={onInputChange}
            required
            minLength={1}
            maxLength={6}
            disabled
          />
          {errors.plate && (
            <span className={styles.errorText}>{errors.plate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Marca*</label>
          <input
            type="text"
            name="brand"
            placeholder="Ej: Toyota"
            value={formData.brand}
            onChange={onInputChange}
            required
            minLength={1}
            maxLength={255}
            disabled={loading}
          />
          {errors.brand && (
            <span className={styles.errorText}>{errors.brand}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Modelo*</label>
          <input
            type="text"
            name="model"
            placeholder="Ej: Corolla"
            value={formData.model}
            onChange={onInputChange}
            required
            maxLength={255}
            minLength={1}
            disabled={loading}
          />
          {errors.model && (
            <span className={styles.errorText}>{errors.model}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Año*</label>
          <input
            type="number"
            name="year"
            placeholder="Ej: 2020"
            value={formData.year}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 4) {
                onInputChange(e);
              }
            }}
            required
            min={1900}
            max={new Date().getFullYear() + 1}
            disabled={loading}
          />

          {errors.year && (
            <span className={styles.errorText}>{errors.year}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Chasis*</label>
          <input
            type="text"
            name="chassis"
            placeholder="Ej: 1HGBH41JXMN109186"
            value={formData.chassis}
            onChange={onInputChange}
            required
            maxLength={255}
            minLength={1}
            disabled={loading}
          />
          {errors.chassis && (
            <span className={styles.errorText}>{errors.chassis}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Motor*</label>
          <input
            type="text"
            name="engine"
            placeholder="Ej: 1600 C.C"
            value={formData.engine}
            onChange={onInputChange}
            required
            maxLength={255}
            minLength={1}
            disabled={loading}
          />
          {errors.engine && (
            <span className={styles.errorText}>{errors.engine}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Kilometraje*</label>
          <input
            type="text"
            name="mileage"
            placeholder="Ej: 150000"
            value={formData.mileage}
            onChange={handleNumericChange}
            required
            min={0}
            max={2000000}
            disabled={loading}
          />
          {errors.mileage && (
            <span className={styles.errorText}>{errors.mileage}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Combustible*</label>
          <select
            name="fuel_type"
            value={formData.fuel_type}
            onChange={onInputChange}
            required
            disabled={loading}
          >
            <option value="">Seleccione...</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diesel">Diésel</option>
            <option value="Electrico">Eléctrico</option>
            <option value="Hibrido">Híbrido</option>
            <option value="Gas">Gas</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.fuel_type && (
            <span className={styles.errorText}>{errors.fuel_type}</span>
          )}
        </div>
      </div>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Tracción</label>
          <input
            type="text"
            name="traccion"
            placeholder="Ej: 4x4"
            value={formData.traccion || ""}
            onChange={onInputChange}
            maxLength={50}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Color</label>
          <input
            type="text"
            name="color"
            placeholder="Ej: Blanco"
            value={formData.color || ""}
            onChange={onInputChange}
            maxLength={50}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Cilindros</label>
          <input
            type="text"
            name="cilindros"
            placeholder="Ej: 4"
            value={formData.cilindros || ""}
            onChange={onInputChange}
            maxLength={10}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Nombre Propietario</label>
          <input
            type="text"
            name="nombre_propietario"
            placeholder="Nombre completo"
            value={formData.nombre_propietario || ""}
            onChange={onInputChange}
            maxLength={255}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Carrocería</label>
          <input
            type="text"
            name="carroceria"
            placeholder="Ej: Sedán"
            value={formData.carroceria || ""}
            onChange={onInputChange}
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Categoría</label>
          <input
            type="text"
            name="categoria"
            placeholder="Ej: Particular"
            value={formData.categoria || ""}
            onChange={onInputChange}
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>VIN</label>
          <input
            type="text"
            name="vin"
            placeholder="Número VIN"
            value={formData.vin || ""}
            onChange={onInputChange}
            maxLength={255}
            disabled={loading}
          />
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.secondaryButton}
          disabled={loading}
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={loading}
          className={styles.primaryButton}
        >
          {loading ? "Procesando..." : "Siguiente"}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
