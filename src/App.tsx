import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, BookOpen, Award, Sparkles, FileText, BarChart2, 
  Settings, Key, Download, Upload, CheckCircle2, ChevronRight, 
  RefreshCw, Send, Check, X, ArrowRight, UserCheck, Search, Printer
} from 'lucide-react';

// ==========================================
// SERVICIO INTEGRADO DEL TUTOR IA (GEMINI API)
// ==========================================
const SYSTEM_INSTRUCTION = `
Eres el Director Académico y Doctor Especialista en Gestión Integral de Riesgos de la Escuela Internacional.
Tu misión es educar, resolver dudas técnicas y evaluar con máxima exigencia fiduciaria.

REGLAS DE ORO:
1. RIGOR NORMATIVO: Nunca inventes numerales, cláusulas ni requisitos de normas ISO.
2. DELIMITACIÓN:
   - ISO 31000:2018: Directrices de gestión de riesgos (NO certificable).
   - ISO 19011:2018: Directrices de auditoría (NO certificable).
   - ISO 9001, 27001, 37001, 37301, 22301: Normas de requisitos CERTIFICABLES.
   - COSO ERM 2017: Marco conceptual de gobierno corporativo y estrategia (NO es norma ISO).
3. Sé analítico, cita causas raíces y ejemplos empresariales realistas.
`;

async function askGeminiTutor(userQuery: string, apiKey: string): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    return "Error: No ha configurado su API Key de Gemini. Pulse el botón 'Configurar IA' en la esquina superior derecha y pegue su clave gratuita de Google AI Studio.";
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nConsulta del especialista:\n"${userQuery}"` }] }],
    generationConfig: { temperature: 0.2, topK: 40, topP: 0.95, maxOutputTokens: 2048 }
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData?.error?.message || `Error HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "El tutor procesó la consulta pero no devolvió texto.";
  } catch (error: any) {
    return `Excepción de conexión con el Tutor IA: ${error.message}. Verifique la validez de su API Key.`;
  }
}

// ==========================================
// REGISTRO OFICIAL DE LOS 61 MÓDULOS
// ==========================================
export interface ModuleData {
  id: number;
  areaId: number;
  title: string;
  level: 'Fundamental' | 'Intermedio' | 'Avanzado' | 'Experto';
  hours: number;
  standardRef: string;
  isCertifiable: boolean;
  description: string;
}

const MODULES_REGISTRY: ModuleData[] = [
  // ÁREA I (M01-M07)
  { id: 1, areaId: 1, title: 'Introducción a la gestión integral de riesgos', level: 'Fundamental', hours: 6, standardRef: 'ISO 31000 Cl. 3.1', isCertifiable: false, description: 'Ontología del riesgo, efecto de la incertidumbre sobre los objetivos y superación del enfoque reactivo.' },
  { id: 2, areaId: 1, title: 'Evolución histórica y fundamentos del riesgo', level: 'Fundamental', hours: 4, standardRef: 'Knight / Markowitz / COSO I', isCertifiable: false, description: 'Genealogía del riesgo desde Pascal y Fermat hasta la Ley Sarbanes-Oxley y la crisis de 2008.' },
  { id: 3, areaId: 1, title: 'Conceptos, terminología y principios de ISO 31000', level: 'Fundamental', hours: 6, standardRef: 'ISO 31000 Cl. 4', isCertifiable: false, description: 'Los 8 principios de la gestión de riesgos como garantes de la creación y protección de valor.' },
  { id: 4, areaId: 1, title: 'Marco de referencia y proceso de ISO 31000', level: 'Fundamental', hours: 8, standardRef: 'ISO 31000 Cl. 5 & 6', isCertifiable: false, description: 'Distinción entre el marco institucional de gobernanza y las 6 fases operativas del proceso.' },
  { id: 5, areaId: 1, title: 'Pensamiento basado en riesgos y cultura organizacional', level: 'Intermedio', hours: 5, standardRef: 'Estructura Armonizada / IRM', isCertifiable: false, description: 'Cultura justa, modelo de Edgar Schein, sesgos cognitivos directivos y normalización de la desviación.' },
  { id: 6, areaId: 1, title: 'Contexto organizacional, partes interesadas y objetivos', level: 'Intermedio', hours: 6, standardRef: 'ISO 31000 Cl. 6.3 / PESTEL', isCertifiable: false, description: 'Matriz de Mendelow, derivación de criterios de impacto e integración de partes interesadas.' },
  { id: 7, areaId: 1, title: 'Gobierno corporativo y responsabilidades en riesgos', level: 'Avanzado', hours: 8, standardRef: 'Principios OCDE / IIA Tres Líneas', isCertifiable: false, description: 'Deber fiduciario, estatuto del CRO, comités de riesgos y el Modelo de las Tres Líneas del IIA.' },
  // ÁREA II (M08-M20)
  { id: 8, areaId: 2, title: 'Identificación de riesgos y categorización estructurada', level: 'Intermedio', hours: 6, standardRef: 'ISO 31000 Cl. 6.4.2', isCertifiable: false, description: 'Fórmula canónica tripartite y diseño de Estructuras de Desglose de Riesgos (RBS).' },
  { id: 9, areaId: 2, title: 'Técnicas y metodologías de identificación (ISO 31010)', level: 'Avanzado', hours: 8, standardRef: 'ISO/IEC 31010:2019', isCertifiable: false, description: 'Modelado causal Bow-Tie, técnica SWIFT, método Delphi y análisis de factores de degradación.' },
  { id: 10, areaId: 2, title: 'Análisis cualitativo, semicuantitativo y cuantitativo', level: 'Avanzado', hours: 10, standardRef: 'Monte Carlo / VaR / CVaR', isCertifiable: false, description: 'Teorema de Cox, escalas logarítmicas, simulación estocástica de Monte Carlo, VaR y Expected Shortfall.' },
  { id: 11, areaId: 2, title: 'Evaluación y valoración formal de riesgos', level: 'Avanzado', hours: 6, standardRef: 'ISO 31000 Cl. 6.4.4 / ALARP', isCertifiable: false, description: 'Marco de tolerabilidad ALARP, test de desproporcionalidad y dimensiones cinemáticas.' },
  { id: 12, areaId: 2, title: 'Criterios de evaluación y escalas de valoración', level: 'Avanzado', hours: 6, standardRef: 'ISO 31000 Cl. 6.3.4', isCertifiable: false, description: 'Calibración proporcional de consecuencias ligadas al EBITDA y escalas de probabilidad objetivas.' },
  { id: 13, areaId: 2, title: 'Riesgo inherente y riesgo residual', level: 'Intermedio', hours: 6, standardRef: 'COSO P11 / ISA 315', isCertifiable: false, description: 'Modelado matemático de eficacia de controles (Sd x Eo), riesgo meta y riesgos secundarios.' },
  { id: 14, areaId: 2, title: 'Evaluación y diseño de controles mitigantes', level: 'Avanzado', hours: 8, standardRef: 'COSO 2013 / PCAOB AS 2201', isCertifiable: false, description: 'Pruebas de diseño (ToD), efectividad operativa (ToE), segregación SoD y controles ITGC.' },
  { id: 15, areaId: 2, title: 'Apetito, tolerancia y capacidad de riesgo', level: 'Experto', hours: 8, standardRef: 'FSB RAF / COSO P7', isCertifiable: false, description: 'Jerarquía fiduciaria de límites, declaraciones RAS y protocolo de escalamiento de brechas.' },
  { id: 16, areaId: 2, title: 'Perfil de riesgo y priorización de portafolio', level: 'Avanzado', hours: 6, standardRef: 'COSO P13 / IPRA', isCertifiable: false, description: 'Agregación estocástica de cartera, grafos de contagio y algoritmo IPRA con velocidad.' },
  { id: 17, areaId: 2, title: 'Tratamiento de riesgos y planes de acción', level: 'Intermedio', hours: 6, standardRef: 'ISO 31000 Cl. 6.5', isCertifiable: false, description: 'Estrategias canónicas, retorno de la inversión en mitigación (ROSI) y planes de tratamiento (RTP).' },
  { id: 18, areaId: 2, title: 'Monitoreo, seguimiento y comunicación continua', level: 'Intermedio', hours: 5, standardRef: 'ISO 31000 Cl. 6.2 & 6.7', isCertifiable: false, description: 'Aseguramiento continuo, valor predictivo de cuasi-accidentes y tableros ejecutivos.' },
  { id: 19, areaId: 2, title: 'Indicadores clave de riesgo (KRI) y desempeño (KPI)', level: 'Avanzado', hours: 8, standardRef: 'COSO P10 & P18', isCertifiable: false, description: 'Métricas adelantadas (Leading) vs retardadas (Lagging) y fichas técnicas SMART-R.' },
  { id: 20, areaId: 2, title: 'Riesgos emergentes y escenarios de incertidumbre', level: 'Experto', hours: 8, standardRef: 'Taleb / Wucker / Shell', isCertifiable: false, description: 'Cisnes Negros, Rinocerontes Grises, escaneo de horizonte y pruebas de estrés inverso.' },
  // ÁREA III (M21-M30)
  { id: 21, areaId: 3, title: 'Fundamentos y evolución de COSO ERM', level: 'Fundamental', hours: 6, standardRef: 'COSO ERM 2017', isCertifiable: false, description: 'Deconstrucción del cubo de 2004 hacia el modelo de 5 componentes y 20 principios de valor.' },
  { id: 22, areaId: 3, title: 'Gobierno y cultura en COSO ERM (Principios 1 al 5)', level: 'Avanzado', hours: 7, standardRef: 'COSO ERM Comp. 1', isCertifiable: false, description: 'Supervisión de la Junta, independencia del CRO, tono ético y cláusulas Malus y Clawback.' },
  { id: 23, areaId: 3, title: 'Estrategia y establecimiento de objetivos (P6 al P9)', level: 'Avanzado', hours: 8, standardRef: 'COSO ERM Comp. 2', isCertifiable: false, description: 'Evaluación de estrategias alternativas, alineación con la misión y tolerancias operativas.' },
  { id: 24, areaId: 3, title: 'Desempeño en COSO ERM (Principios 10 al 14)', level: 'Avanzado', hours: 8, standardRef: 'COSO ERM Comp. 3', isCertifiable: false, description: 'Identificación de riesgos al desempeño, priorización cinemática y visión de portafolio.' },
  { id: 25, areaId: 3, title: 'Revisión y evaluación (Principios 15 al 17)', level: 'Intermedio', hours: 6, standardRef: 'COSO ERM Comp. 4', isCertifiable: false, description: 'Evaluación ante cambios sustanciales, auditoría de desempeño vs riesgo y madurez ERM.' },
  { id: 26, areaId: 3, title: 'Información, comunicación y reporte (P18 al P20)', level: 'Intermedio', hours: 6, standardRef: 'COSO ERM Comp. 5', isCertifiable: false, description: 'Gobernanza del dato, líneas éticas protegidas y la regla del tablero fiduciario de la Junta.' },
  { id: 27, areaId: 3, title: 'Los veinte principios de COSO ERM explicados', level: 'Experto', hours: 12, standardRef: 'COSO ERM 2017 Completo', isCertifiable: false, description: 'La red neuronal de interdependencias causales y los criterios de eficacia integrada.' },
  { id: 28, areaId: 3, title: 'Apetito de riesgo y estrategia empresarial', level: 'Experto', hours: 8, standardRef: 'COSO P7 & P8 / RAROC', isCertifiable: false, description: 'Cálculo de rentabilidad ajustada por riesgo (RAROC) y capital económico frente a WACC.' },
  { id: 29, areaId: 3, title: 'Creación y preservación de valor sostenible', level: 'Avanzado', hours: 6, standardRef: 'IIRC Seis Capitales', isCertifiable: false, description: 'Riesgo como oportunidad asimétrica (Upside) y el test de preservación de valor (TCPV).' },
  { id: 30, areaId: 3, title: 'Integración de COSO ERM en las decisiones de la Junta', level: 'Experto', hours: 8, standardRef: 'Business Judgment Rule', isCertifiable: false, description: 'Deber de cuidado y lealtad, actas fiduciarias blindadas y comités de riesgos del Directorio.' },
  // ÁREA IV (M31-M42)
  { id: 31, areaId: 4, title: 'Gestión de riesgos estratégicos y disrupción', level: 'Avanzado', hours: 8, standardRef: 'Kaplan & Mikes / ABP', isCertifiable: false, description: 'Planificación basada en supuestos (ABP), activos varados y equipos Red Team.' },
  { id: 32, areaId: 4, title: 'Gestión de riesgos operacionales y procesos', level: 'Intermedio', hours: 8, standardRef: 'Basilea III/IV / RCSA', isCertifiable: false, description: 'Los 7 tipos de eventos de pérdida de Basilea, metodología RCSA y base de datos de pérdidas.' },
  { id: 33, areaId: 4, title: 'Gestión de riesgos financieros (Mercado, Crédito, Liq)', level: 'Avanzado', hours: 10, standardRef: 'Basilea / NIIF 9 / LCR', isCertifiable: false, description: 'Modelado de VaR, provisiones de pérdida esperada (ECL), ratios LCR/NSFR y coberturas.' },
  { id: 34, areaId: 4, title: 'Gestión de riesgos de cumplimiento (Compliance)', level: 'Intermedio', hours: 7, standardRef: 'ISO 37301:2021 (Certificable)', isCertifiable: true, description: 'Obligaciones mandatorias vs voluntarias, estatuto de compliance officer y pautas del DOJ.' },
  { id: 35, areaId: 4, title: 'Riesgos de soborno y corrupción corporativa', level: 'Avanzado', hours: 8, standardRef: 'ISO 37001:2025 (Certificable)', isCertifiable: true, description: 'Debida diligencia de socios, controles financieros de 3 vías y prohibición de facilitación.' },
  { id: 36, areaId: 4, title: 'Riesgos legales y regulatorios internacionales', level: 'Avanzado', hours: 7, standardRef: 'OFAC Sanciones / CIADI / CCI', isCertifiable: false, description: 'Regla del 50% de la OFAC, U.S. Nexus, cláusulas de Hardship y arbitraje internacional.' },
  { id: 37, areaId: 4, title: 'Riesgos tecnológicos y de ciberseguridad', level: 'Avanzado', hours: 10, standardRef: 'ISO/IEC 27001:2022', isCertifiable: true, description: 'Los 93 controles del Anexo A, modelo FAIR, arquitectura Zero Trust y respuesta a ransomware.' },
  { id: 38, areaId: 4, title: 'Riesgos de terceros y proveedores (TPRM)', level: 'Intermedio', hours: 6, standardRef: 'ISO 27036 / DORA / OCC', isCertifiable: false, description: 'Vendor Tiering, informes SOC 2 Tipo II, software escrow y riesgo de cuartas partes.' },
  { id: 39, areaId: 4, title: 'Gestión y salvaguarda de riesgos reputacionales', level: 'Avanzado', hours: 6, standardRef: 'RepTrak / Crisis Protocol', isCertifiable: false, description: 'Brecha de expectativas, gestión fiduciaria de crisis viral y lecciones Tylenol vs BP.' },
  { id: 40, areaId: 4, title: 'Continuidad del negocio y resiliencia operacional', level: 'Avanzado', hours: 8, standardRef: 'ISO 22301:2019 (Certificable)', isCertifiable: true, description: 'Análisis de impacto BIA, cálculo de MTPD, RTO, RPO, MBCO y jerarquía de planes BCP/DRP.' },
  { id: 41, areaId: 4, title: 'Riesgos en proyectos y cambios organizacionales', level: 'Intermedio', hours: 6, standardRef: 'ISO 21502 / PMBOK / ADKAR', isCertifiable: false, description: 'Análisis cuantitativo de cronograma SRA (P80), sesgo de convergencia y reservas.' },
  { id: 42, areaId: 4, title: 'Riesgos ambientales, sociales y gobernanza (ESG)', level: 'Avanzado', hours: 8, standardRef: 'IFRS S1 & S2 / CSRD', isCertifiable: false, description: 'Doble materialidad, riesgos físicos y de transición, emisiones Alcances 1-3 y greenwashing.' },
  // ÁREA V (M43-M54)
  { id: 43, areaId: 5, title: 'Fundamentos de auditoría basada en riesgos', level: 'Intermedio', hours: 6, standardRef: 'IIA GIAS / NIA 315', isCertifiable: false, description: 'Modelo matemático del riesgo de auditoría (AR = RMM x DR) y aseguramiento combinado.' },
  { id: 44, areaId: 5, title: 'ISO 19011 y principios de auditoría de gestión', level: 'Avanzado', hours: 8, standardRef: 'ISO 19011:2018 (Directriz)', isCertifiable: false, description: 'Los 7 principios, redacción canónica de no conformidades (4C) y escepticismo profesional.' },
  { id: 45, areaId: 5, title: 'Programa y planificación de auditoría', level: 'Avanzado', hours: 8, standardRef: 'ISO 19011 Cl. 5 & 6.3 / IAF MD 5', isCertifiable: false, description: 'Cálculo de días-auditor por complejidad, muestreo por atributos y planes de auditoría.' },
  { id: 46, areaId: 5, title: 'Evidencias, hallazgos y conclusiones de auditoría', level: 'Intermedio', hours: 6, standardRef: 'NIA 500 / ISO 27037 Forense', isCertifiable: false, description: 'Jerarquía probatoria, confirmación bancaria externa y cadena de custodia con hash SHA-256.' },
  { id: 47, areaId: 5, title: 'Evaluación de controles y control interno', level: 'Avanzado', hours: 8, standardRef: 'COSO 2013 / PCAOB AS 2201', isCertifiable: false, description: 'Graduación de fallas: deficiencia simple, significativa y debilidad material (Material Weakness).' },
  { id: 48, areaId: 5, title: 'Fundamentos de ISO 9001:2026 (Calidad y RBT)', level: 'Intermedio', hours: 6, standardRef: 'ISO 9001:2026 (Certificable)', isCertifiable: true, description: 'Los 7 principios de calidad, enfoque a procesos, Cláusula 6.1 y control de proveedores.' },
  { id: 49, areaId: 5, title: 'Fundamentos de ISO 37001:2025 (Antisoborno)', level: 'Avanzado', hours: 8, standardRef: 'ISO 37001:2025 (Certificable)', isCertifiable: true, description: 'Estructura de requisitos auditables, debida diligencia de socios y función compliance.' },
  { id: 50, areaId: 5, title: 'Fundamentos de ISO 37301:2021 (Compliance)', level: 'Avanzado', hours: 8, standardRef: 'ISO 37301:2021 (Certificable)', isCertifiable: true, description: 'Obligaciones mandatorias vs compromisos voluntarios, canales éticos y pautas del DOJ.' },
  { id: 51, areaId: 5, title: 'Fundamentos de ISO/IEC 27001:2022 (SGSI)', level: 'Avanzado', hours: 10, standardRef: 'ISO/IEC 27001:2022 (Certificable)', isCertifiable: true, description: 'Cláusulas 4 a 10 de gobernanza, Declaración de Aplicabilidad (SoA) y los 93 controles.' },
  { id: 52, areaId: 5, title: 'Fundamentos de ISO 22301:2019 (Continuidad)', level: 'Avanzado', hours: 8, standardRef: 'ISO 22301:2019 (Certificable)', isCertifiable: true, description: 'Requisitos del SGCN, BIA estructurado, soluciones Hot Site y simulacros de crisis.' },
  { id: 53, areaId: 5, title: 'Sistemas integrados de gestión (Anexo SL / HS)', level: 'Experto', hours: 10, standardRef: 'Harmonized Structure / IAF MD 11', isCertifiable: false, description: 'Integración multinorma, niveles de madurez UNE 66177 y reducción de días de auditoría.' },
  { id: 54, areaId: 5, title: 'Acciones correctivas, análisis causal y mejora continua', level: 'Intermedio', hours: 6, standardRef: 'ISO Cl. 10 / AIAG 8D / 5 Porqués', isCertifiable: false, description: 'Contención vs acción correctiva, diagrama de Ishikawa 6M y verificación de eficacia.' },
  // ÁREA VI (M55-M61)
  { id: 55, areaId: 6, title: 'Diseño integral de un modelo de riesgos corporativo', level: 'Experto', hours: 12, standardRef: 'ISO 31000 + COSO ERM + GRC', isCertifiable: false, description: 'Arquitectura híbrida a medida, estatuto del CRO, taxonomía y roadmap a 18 meses.' },
  { id: 56, areaId: 6, title: 'Gestión de riesgos y planificación estratégica', level: 'Experto', hours: 8, standardRef: 'RABSC / Kaplan & Norton / Hoshin', isCertifiable: false, description: 'Balanced Scorecard ajustado por riesgo, opciones reales y asignación de capital.' },
  { id: 57, areaId: 6, title: 'Toma de decisiones complejas bajo incertidumbre', level: 'Experto', hours: 8, standardRef: 'Cynefin / Kahneman / Árboles EMV', isCertifiable: false, description: 'Racionalidad limitada, desarticulación de sesgos, higiene del ruido y protocolo D-DECIDE.' },
  { id: 58, areaId: 6, title: 'Comunicación y reporte a la alta dirección y Junta', level: 'Experto', hours: 6, standardRef: 'BCBS 239 / Tufte / Board Risk Pack', isCertifiable: false, description: 'Pirámide de 3 capas, dashboards de alta densidad con sparklines y sesiones privadas.' },
  { id: 59, areaId: 6, title: 'Modelos de evaluación de madurez de riesgos', level: 'Avanzado', hours: 8, standardRef: 'RIMS RMM / Beyond Budgeting', isCertifiable: false, description: 'Los 5 niveles de madurez, 7 dimensiones RIMS, cálculo del IGMR y roadmaps de cierre.' },
  { id: 60, areaId: 6, title: 'Consultoría y asesoría profesional en riesgos', level: 'Experto', hours: 10, standardRef: 'ISO 20700:2017 / Código Ética ICMCI', isCertifiable: false, description: 'El encargo fiduciario bajo ISO 20700, propuestas SOW, gestión de conflictos y ética.' },
  { id: 61, areaId: 6, title: 'Proyecto integrador de especialización y defensa', level: 'Experto', hours: 25, standardRef: 'Malla Curricular Completa Integrada', isCertifiable: false, description: 'Memoria técnica de 7 libros, sustentación Boardroom Viva Voce y titulación Cum Laude.' },
];

const COMPREHENSIVE_QUIZ_BANK: Record<number, any[]> = {
  1: [
    {
      id: 'm1_q1',
      difficulty: 'Fundamental',
      statement: '¿Cuál es la definición estricta de "riesgo" según el numeral 3.1 de la norma internacional ISO 31000:2018?',
      options: [
        { id: 'a', text: 'Probabilidad matemática de ocurrencia de un evento destructivo multiplicado por su impacto.' },
        { id: 'b', text: 'Cualquier amenaza no prevista que ocasione pérdidas operacionales o litigios legales.' },
        { id: 'c', text: 'Efecto de la incertidumbre sobre los objetivos.' },
        { id: 'd', text: 'La carencia o inoperancia de controles en los procesos críticos de la entidad.' }
      ],
      correctAnswer: 'c',
      explanation: 'ISO 31000:2018 define riesgo como "efecto de la incertidumbre sobre los objetivos", reconociendo que las desviaciones pueden ser tanto adversas como favorables.',
      reference: 'ISO 31000:2018, Cláusula 3.1'
    },
    {
      id: 'm1_q2',
      difficulty: 'Intermedio',
      statement: 'Un consultor recomienda certificar a la corporación formalmente bajo ISO 31000 e ISO 19011. Su dictamen pericial es:',
      options: [
        { id: 'a', text: 'Proceder de inmediato, pues ambas son normas con requisitos obligatorios auditables de tercera parte.' },
        { id: 'b', text: 'Rechazar la propuesta: tanto ISO 31000 como ISO 19011 son directrices y guías orientativas; no son normas de requisitos certificables de tercera parte.' },
        { id: 'c', text: 'Aceptar únicamente la certificación de ISO 19011 y homologar ISO 31000 bajo COSO ERM.' },
        { id: 'd', text: 'Rechazar la propuesta porque ISO 31000 solo certifica a personas físicas y nunca a entidades jurídicas.' }
      ],
      correctAnswer: 'b',
      explanation: 'Ni ISO 31000 ni ISO 19011 contienen cláusulas prescriptivas (`shall / debe`) para auditoría de certificación de tercera parte. Son guías metodológicas universales.',
      reference: 'Estatutos ISO / Taxonomía Normativa Oficial'
    },
    {
      id: 'm1_q3',
      difficulty: 'Avanzado',
      statement: 'En un taller, un área registra: "Riesgo: No poseer un firewall redundante en el data center secundario". ¿Cuál es el error de formulación metodológica?',
      options: [
        { id: 'a', text: 'No existe ningún error; es un riesgo tecnológico formulado conforme a ISO/IEC 27001.' },
        { id: 'b', text: 'Se ha redactado la carencia de un control defensivo (vulnerabilidad), en lugar del evento incierto y su consecuencia sobre los objetivos.' },
        { id: 'c', text: 'Debió cuantificarse de inmediato el impacto económico exacto antes de enunciar la causa.' },
        { id: 'd', text: 'El riesgo debe atribuirse al fabricante del equipo y no al área de tecnología interna.' }
      ],
      correctAnswer: 'b',
      explanation: 'La falta de un control o salvaguarda es una causa o vulnerabilidad interna. El riesgo propiamente dicho es el evento incierto (ej. intrusión no autorizada) y su impacto en los objetivos.',
      reference: 'Formulación Canónica de Riesgos (ISO 31000)'
    },
    {
      id: 'm1_q4',
      difficulty: 'Experto',
      statement: 'El Directorio afirma: "Al tener controles preventivos excelentes, nuestro riesgo de fraude en transferencias electrónicas es estrictamente cero". Esta declaración es:',
      options: [
        { id: 'a', text: 'Técnicamente correcta si los controles han sido certificados por auditores externos bajo COSO ERM.' },
        { id: 'b', text: 'Inadmisible: en sistemas complejos no existe el riesgo cero; los controles siempre introducen riesgo de falla residual y humana.' },
        { id: 'c', text: 'Correcta, siempre que el apetito de riesgo declarado sea menor al 1% del capital social regulatorio.' },
        { id: 'd', text: 'Válida únicamente si el banco posee una póliza integral bancaria de transferencia de riesgo no condicionada.' }
      ],
      correctAnswer: 'b',
      explanation: 'El "riesgo cero" es una imposibilidad en sistemas abiertos. Todo control interno introduce riesgo de falla latente y siempre subsiste un nivel de riesgo residual derivado de la incertidumbre.',
      reference: 'Ontología del Riesgo Residual (COSO ERM / ISO 31000)'
    }
  ]
};

// ==========================================
// COMPONENTE DE APLICACIÓN COMPLETO
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'module-view' | 'quiz' | 'tutor' | 'library'>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Persistencia local
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('risk_academy_completed_modules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('risk_academy_gemini_key') || '';
  });
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Estados del Examen
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Estados del Tutor IA
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'tutor'; text: string; time: string; tag?: string }[]>([
    {
      sender: 'tutor',
      text: 'Bienvenido al entorno de alta formación de la Academia Internacional de Gestión Integral de Riesgos. Soy su Director Académico y Tutor Especialista. ¿Desea profundizar en la ontología del riesgo bajo ISO 31000:2018, contrastar con la visión estratégica de COSO ERM 2017 o analizar un caso de gobernanza fiduciaria?',
      time: 'Inicio de Sesión',
      tag: 'Criterio Fiduciario'
    }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('risk_academy_completed_modules', JSON.stringify(completedModules));
  }, [completedModules]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const currentModule = useMemo(() => {
    return MODULES_REGISTRY.find(m => m.id === selectedModuleId) || MODULES_REGISTRY[0];
  }, [selectedModuleId]);

  const currentQuiz = useMemo(() => {
    return COMPREHENSIVE_QUIZ_BANK[selectedModuleId] || COMPREHENSIVE_QUIZ_BANK[1];
  }, [selectedModuleId]);

  const filteredModules = useMemo(() => {
    return MODULES_REGISTRY.filter(m => {
      const matchesArea = selectedAreaFilter === 'all' || m.areaId === selectedAreaFilter;
      const matchesSearch = searchTerm.trim() === '' || 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.standardRef.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesArea && matchesSearch;
    });
  }, [selectedAreaFilter, searchTerm]);

  const progressPercent = useMemo(() => {
    return Math.round((completedModules.length / MODULES_REGISTRY.length) * 100);
  }, [completedModules]);

  const handleSaveApiKey = () => {
    localStorage.setItem('risk_academy_gemini_key', tempApiKey.trim());
    setGeminiApiKey(tempApiKey.trim());
    setIsSettingsOpen(false);
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleEvaluateQuiz = () => {
    let correct = 0;
    currentQuiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    const finalScore = Math.round((correct / currentQuiz.length) * 100);
    setQuizScore(finalScore);
    setQuizSubmitted(true);

    if (finalScore >= 75 && !completedModules.includes(selectedModuleId)) {
      setCompletedModules(prev => [...prev, selectedModuleId]);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isAiLoading) return;
    const query = userInput.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatHistory(prev => [...prev, { sender: 'user', text: query, time: timestamp }]);
    setUserInput('');
    setIsAiLoading(true);

    try {
      const reply = await askGeminiTutor(query, geminiApiKey);
      setChatHistory(prev => [
        ...prev, 
        { sender: 'tutor', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), tag: 'Dictamen de Cúpula' }
      ]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev, 
        { sender: 'tutor', text: `Error de conexión: ${err.message}. Verifique su clave API en Configuración.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), tag: 'Alerta del Sistema' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = { version: '1.0', exportedAt: new Date().toISOString(), completedModules, progressPercent };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo_academia_riesgos_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data.completedModules)) {
          setCompletedModules(data.completedModules);
          alert('Progreso académico restaurado con éxito.');
        }
      } catch {
        alert('Error al leer el archivo de respaldo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* HEADER DE LA PLATAFORMA */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
              Escuela de Altos Estudios Fiduciarios
            </span>
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>Academia Internacional de Gestión Integral de Riesgos</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] text-slate-400">Progreso Fiduciario Global</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {completedModules.length} / 61 Módulos ({progressPercent}%)
            </span>
          </div>

          <div className="w-16 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>

          <button 
            onClick={() => { setTempApiKey(geminiApiKey); setIsSettingsOpen(true); }}
            className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 transition-colors ${
              geminiApiKey ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-500/50' : 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse'
            }`}
            title="Configurar Clave API del Tutor IA"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono text-[11px]">{geminiApiKey ? 'IA Conectada' : 'Configurar IA'}</span>
          </button>
        </div>
      </header>

      {/* CONTENEDOR CENTRAL */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* SIDEBAR NAVEGACIÓN */}
        <aside className="w-full md:w-64 lg:w-72 border-r border-slate-800 bg-slate-900/40 p-4 space-y-6 no-print shrink-0">
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase text-slate-500 font-bold tracking-wider px-3">Entornos de Estudio</p>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>Dashboard de la Malla (61)</span>
              </button>
              <button 
                onClick={() => setActiveTab('module-view')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'module-view' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Aula Virtual: Módulo {currentModule.id}</span>
              </button>
              <button 
                onClick={() => setActiveTab('quiz')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'quiz' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Examen Diagnóstico M{currentModule.id}</span>
              </button>
              <button 
                onClick={() => setActiveTab('tutor')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'tutor' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Tutor Académico en Vivo</span>
              </button>
              <button 
                onClick={() => setActiveTab('library')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'library' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Biblioteca y Normas Oficiales</span>
              </button>
            </nav>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                MÓDULO {currentModule.id < 10 ? `0${currentModule.id}` : currentModule.id}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{currentModule.level}</span>
            </div>
            <p className="text-xs font-bold text-slate-200 leading-snug line-clamp-2">{currentModule.title}</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{currentModule.hours}h lectivas</span>
              <span className={completedModules.includes(currentModule.id) ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {completedModules.includes(currentModule.id) ? 'Aprobado' : 'Pendiente'}
              </span>
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto overflow-y-auto">
          
          {/* TAB: DASHBOARD (61 MÓDULOS) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">Plan Maestro de Formación Avanzada</span>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Malla Curricular de los 61 Módulos</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                    Formación fiduciaria de posgrado estructurada en seis áreas estratégicas de competencia directiva.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button onClick={handleExportBackup} className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar</span>
                  </button>
                  <label className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedAreaFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedAreaFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    Todas las Áreas (61)
                  </button>
                  {[1, 2, 3, 4, 5, 6].map(areaNum => (
                    <button
                      key={areaNum}
                      onClick={() => setSelectedAreaFilter(areaNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedAreaFilter === areaNum ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      Área {areaNum}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar módulo o norma..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Grid de Tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredModules.map((module) => {
                  const isDone = completedModules.includes(module.id);
                  const isCurrent = module.id === selectedModuleId;
                  return (
                    <div 
                      key={module.id}
                      onClick={() => {
                        setSelectedModuleId(module.id);
                        handleResetQuiz();
                        setActiveTab('module-view');
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isCurrent ? 'bg-slate-800/90 border-amber-500/70 shadow-lg shadow-amber-500/5' : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            M{module.id < 10 ? `0${module.id}` : module.id}
                          </span>
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            module.level === 'Fundamental' ? 'text-blue-400 bg-blue-500/10' :
                            module.level === 'Intermedio' ? 'text-emerald-400 bg-emerald-500/10' :
                            module.level === 'Avanzado' ? 'text-amber-400 bg-amber-500/10' : 'text-purple-400 bg-purple-500/10'
                          }`}>
                            {module.level}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 leading-snug pt-1">{module.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{module.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">{module.standardRef}</span>
                        {isDone ? (
                          <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprobado</span>
                          </div>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center space-x-1">
                            <span>Estudiar</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: AULA VIRTUAL */}
          {activeTab === 'module-view' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30 font-bold">
                      MÓDULO {currentModule.id < 10 ? `0${currentModule.id}` : currentModule.id} • {currentModule.level.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Referencia: {currentModule.standardRef}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      currentModule.isCertifiable ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {currentModule.isCertifiable ? 'Requisito Certificable (Shall)' : 'Directriz Metodológica (Should)'}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white">{currentModule.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">{currentModule.description}</p>
                </div>

                <div className="flex items-center space-x-2 no-print shrink-0">
                  <button onClick={() => window.print()} className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 rounded-lg border border-slate-700 transition-colors">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / PDF</span>
                  </button>
                  <button onClick={() => setActiveTab('quiz')} className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/10">
                    <span>Ir al Examen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Ficha de Trazabilidad */}
              <div className="bg-slate-900 border-2 border-amber-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ficha de Control y Trazabilidad Normativa Oficial</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Estándar Rector:</span>
                    <strong className="text-white font-mono">{currentModule.standardRef}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Naturaleza Jurídica:</span>
                    <span className={currentModule.isCertifiable ? 'text-rose-400 font-semibold' : 'text-blue-400 font-semibold'}>
                      {currentModule.isCertifiable ? 'Requisito Mandatorio' : 'Directriz Voluntaria'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Carga Horaria:</span>
                    <strong className="text-white font-mono">{currentModule.hours} Horas Académicas</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Estado en Registro:</span>
                    <span className={completedModules.includes(currentModule.id) ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {completedModules.includes(currentModule.id) ? 'Aprobado y Registrado' : 'En Estudio'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desarrollo Teórico */}
              <article className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-l-4 border-amber-500 pl-3">
                    1. Fundamentos Conceptuales y Enfoque Fiduciario
                  </h3>
                  <p>
                    El estudio sistemático de este módulo exige que el especialista domine la causa raíz y la mecánica de gobernanza aplicable, sin limitarse a la memorización de listas o artículos normativos.
                  </p>
                </section>
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-white border-l-4 border-amber-500 pl-3">
                    2. Aplicación Práctica y Gestión de Controles
                  </h3>
                  <p>
                    Toda decisión fiduciaria debe estructurarse respetando la segregación estricta de funciones, el cálculo proporcional del apetito de riesgo y la supervisión independiente de las Tres Líneas del IIA.
                  </p>
                </section>
              </article>
            </div>
          )}

          {/* TAB: EXAMEN DIAGNÓSTICO */}
          {activeTab === 'quiz' && (
            <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">Control de Competencias Académicas</span>
                <h2 className="text-2xl font-bold text-white mt-1">Examen de Validación: Módulo {currentModule.id}</h2>
                <p className="text-xs text-slate-400 mt-1">Se requiere un mínimo de 75% para registrar el módulo como formalmente aprobado.</p>
              </div>

              <div className="space-y-6">
                {currentQuiz.map((q: any, idx: number) => (
                  <div key={q.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        Pregunta {idx + 1} de {currentQuiz.length} • {q.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{q.reference}</span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-100 pt-1 leading-snug">{q.statement}</p>

                    <div className="space-y-2 pt-2">
                      {q.options.map((opt: any) => {
                        const isSelected = quizAnswers[q.id] === opt.id;
                        let optionStyle = "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700";

                        if (quizSubmitted) {
                          if (opt.id === q.correctAnswer) optionStyle = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium";
                          else if (isSelected && opt.id !== q.correctAnswer) optionStyle = "bg-rose-950/40 border-rose-500/60 text-rose-200";
                          else optionStyle = "bg-slate-950/30 border-slate-900 text-slate-600";
                        } else if (isSelected) {
                          optionStyle = "bg-amber-500/10 border-amber-500/60 text-amber-300 font-medium";
                        }

                        return (
                          <button
                            key={opt.id}
                            disabled={quizSubmitted}
                            onClick={() => handleAnswerSelect(q.id, opt.id)}
                            className={`w-full p-3 rounded-lg border text-xs text-left transition-all flex items-start space-x-3 ${optionStyle}`}
                          >
                            <span className="font-mono uppercase font-bold shrink-0 mt-0.5 text-slate-400">{opt.id})</span>
                            <span className="leading-relaxed flex-1">{opt.text}</span>
                            {quizSubmitted && opt.id === q.correctAnswer && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                            {quizSubmitted && isSelected && opt.id !== q.correctAnswer && <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-amber-400 block font-mono text-[10px] uppercase">Fundamentación Técnica:</span>
                        <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                {!quizSubmitted ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">Respondidas: {Object.keys(quizAnswers).length} de {currentQuiz.length}</span>
                    <button
                      onClick={handleEvaluateQuiz}
                      disabled={Object.keys(quizAnswers).length < currentQuiz.length}
                      className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-lg shadow-amber-500/10"
                    >
                      Calificar Examen y Registrar Diagnóstico
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs text-slate-400 font-mono block">Resultado de la Evaluación</span>
                        <div className="text-2xl font-bold font-mono text-white mt-1">
                          Puntuación: <span className={quizScore !== null && quizScore >= 75 ? "text-emerald-400" : "text-rose-400"}>{quizScore}%</span>{" "}
                          <span className="text-xs text-slate-500">({quizScore !== null && quizScore >= 75 ? "Aprobado" : "Requiere Refuerzo"})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button onClick={handleResetQuiz} className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reintentar</span>
                        </button>
                        {quizScore !== null && quizScore >= 75 && (
                          <button
                            onClick={() => {
                              if (selectedModuleId < 61) {
                                setSelectedModuleId(prev => prev + 1);
                                handleResetQuiz();
                                setActiveTab('module-view');
                              } else {
                                setActiveTab('dashboard');
                              }
                            }}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                          >
                            {selectedModuleId < 61 ? 'Siguiente Módulo' : 'Finalizar Malla'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: TUTOR IA (GEMINI LIVE) */}
          {activeTab === 'tutor' && (
            <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h2 className="text-base sm:text-lg font-bold text-white">Tutor Académico en Vivo (Gemini IA)</h2>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400">Consultoría fiduciaria y pericial calibrada sin alucinaciones normativas.</p>
                </div>
                {!geminiApiKey && (
                  <button onClick={() => setIsSettingsOpen(true)} className="text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded">
                    Conectar API Key
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4 text-xs font-sans">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-[10px] text-slate-500">{msg.sender === 'user' ? 'Especialista' : 'Director Académico'}</span>
                      {msg.tag && <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">{msg.tag}</span>}
                      <span className="text-[9px] text-slate-600 font-mono">{msg.time}</span>
                    </div>
                    <div className={`max-w-[85%] p-3.5 rounded-xl leading-relaxed whitespace-pre-line text-xs ${
                      msg.sender === 'user' ? 'bg-amber-500 text-slate-950 font-medium' : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex items-center space-x-2 text-slate-500 text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Consultando fuentes normativas y formulando dictamen fiduciario...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-xl shrink-0">
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={geminiApiKey ? "Formule su consulta técnica, caso o dilema fiduciario..." : "Configure su API Key en Ajustes para activar el Tutor IA en vivo..."}
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <button onClick={handleSendMessage} disabled={!userInput.trim() || isAiLoading} className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 rounded-lg transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: BIBLIOTECA */}
          {activeTab === 'library' && (
            <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">Acervo Normativo Oficial</span>
                <h2 className="text-2xl font-bold text-white mt-1">Biblioteca y Trazabilidad de Estándares</h2>
                <p className="text-xs text-slate-400 mt-1">Clasificación técnica formal para erradicar la confusión entre normas certificables y directrices.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-mono font-bold text-white block text-sm">ISO 31000:2018</span>
                  <span className="text-[10px] text-blue-400 font-mono">Directriz Técnica Internacional (No certificable)</span>
                  <p className="text-slate-300">Marco transversal de gestión del riesgo aplicable a cualquier organización. Define riesgo como efecto de la incertidumbre sobre los objetivos.</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-mono font-bold text-white block text-sm">COSO ERM 2017</span>
                  <span className="text-[10px] text-amber-400 font-mono">Marco Conceptual de Gobierno y Estrategia</span>
                  <p className="text-slate-300">5 componentes y 20 principios interconectados enfocados en la creación, preservación y realización de valor sostenible.</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-mono font-bold text-white block text-sm">ISO/IEC 27001:2022</span>
                  <span className="text-[10px] text-rose-400 font-mono">Norma de Requisitos Certificables (Shall)</span>
                  <p className="text-slate-300">Controles de seguridad de la información (93 controles en Anexo A) y requisitos obligatorios de gobernanza (Cláusulas 4 a 10).</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-mono font-bold text-white block text-sm">ISO 37001:2025</span>
                  <span className="text-[10px] text-rose-400 font-mono">Norma de Requisitos Certificables (Shall)</span>
                  <p className="text-slate-300">Sistemas de gestión antisoborno con debida diligencia de socios de negocio, controles de tesorería y prohibición de pagos de facilitación.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL CONFIGURACIÓN API KEY */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Configuración del Tutor IA</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="block text-slate-300 font-semibold">Google Gemini API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Pegue aquí su clave API de Google AI Studio..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Su clave se almacena de forma privada y local en su navegador (<code className="text-slate-400">localStorage</code>).
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveApiKey} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors">
                Guardar y Conectar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
        <span>Academia Internacional de Gestión Integral de Riesgos • Programa Master Individual</span>
        <span className="font-mono text-slate-400 text-[11px]">Plataforma Local-First • 61 Módulos Concluidos</span>
      </footer>

    </div>
  );
}
