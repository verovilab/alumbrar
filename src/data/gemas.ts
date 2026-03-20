export type GemaCategory = 'Calma' | 'Perdón' | 'Percepción' | 'Confianza' | 'Relaciones' | 'Presencia';

export interface Gema {
  id: number;
  phrase: string;
  idea: string;
  action: string;
  mantra: string;
  category: GemaCategory;
}

export const GEMAS: Gema[] = [
  {
    id: 1,
    phrase: "La paz de Dios refulge en mí ahora.",
    idea: "La paz no es algo que debas fabricar, sino algo que ya habita en tu centro. Solo necesitas dejar de lado los ruidos que tú mismo has creado.",
    action: "Cierra los ojos por 60 segundos y repite mentalmente: 'No soy mis pensamientos'. Observa cómo pasan como nubes.",
    mantra: "Elijo la paz de Dios en lugar de esto.",
    category: "Calma"
  },
  {
    id: 2,
    phrase: "El perdón es la llave de la felicidad.",
    idea: "Perdonar no es validar el error ajeno, es liberar tu propia mente del peso del pasado. Es el regalo más grande que te haces a ti mismo.",
    action: "Identifica un pequeño juicio que tengas hoy hacia alguien. Di internamente: 'Te libero y me libero'.",
    mantra: "Mi felicidad y mi perdón son lo mismo.",
    category: "Perdón"
  },
  {
    id: 3,
    phrase: "Nada de lo que veo significa nada.",
    idea: "Tus ojos solo ven lo que tu mente ha proyectado. Si cambias el propósito de tu mirada, el mundo que ves cambiará contigo.",
    action: "Mirás un objeto 10 segundos y soltás el juicio: 'solo estoy mirando'.",
    mantra: "Estoy decidido a ver esto de otra manera.",
    category: "Percepción"
  },
  {
    id: 4,
    phrase: "No soy un cuerpo. Soy libre.",
    idea: "Tu identidad no está limitada por la forma física. Eres una extensión del Amor infinito, invulnerable a las leyes del mundo.",
    action: "Antes de responder un mensaje, respirás una vez y elegís un tono amable.",
    mantra: "Aún soy tal como Dios me creó.",
    category: "Confianza"
  },
  {
    id: 5,
    phrase: "En mi hermano me veo a mí mismo.",
    idea: "Cada persona es un espejo. If ves luz en ellos, estás reconociendo la luz que ya brilla en ti.",
    action: "Agradecés una cosa simple en voz baja y seguís tu camino.",
    mantra: "Solo veo al Santo Hijo de Dios en ti.",
    category: "Relaciones"
  },
  {
    id: 6,
    phrase: "Este instante es el único tiempo que hay.",
    idea: "El pasado ya no existe y el futuro es una fantasía. El Espíritu Santo habita en el ahora. Aquí es donde sucede el milagro.",
    action: "Elegís un pensamiento repetido y lo etiquetás: 'esto es percepción'.",
    mantra: "Santo es este momento.",
    category: "Presencia"
  },
  {
  id: 7,
  phrase: "Nada real puede ser amenazado.",
  idea: "La calma surge cuando recuerdas que lo que verdaderamente eres no puede ser tocado por los acontecimientos.",
  action: "Respirá profundo y soltá los hombros durante 3 inhalaciones.",
  mantra: "Estoy a salvo en la verdad.",
  category: "Calma"
},
{
  id: 8,
  phrase: "Descanso en Dios ahora.",
  idea: "La paz es tu estado natural cuando dejas de luchar contra el momento presente.",
  action: "Detenete 30 segundos y siente tus pies en el suelo.",
  mantra: "Me permito descansar.",
  category: "Calma"
},
{
  id: 9,
  phrase: "La quietud es mi fuerza.",
  idea: "No necesitas hacer nada para estar en paz; basta con dejar de resistir.",
  action: "Mirá a tu alrededor y nombra 3 cosas que ves.",
  mantra: "Aquí estoy en paz.",
  category: "Calma"
},
{
  id: 10,
  phrase: "La paz me envuelve.",
  idea: "La paz no viene del mundo, viene de tu elección interna.",
  action: "Sonreí suavemente por 10 segundos.",
  mantra: "Elijo la paz ahora.",
  category: "Calma"
},
{
  id: 11,
  phrase: "Estoy sostenido por el Amor.",
  idea: "La calma nace cuando confías en que no estás solo.",
  action: "Apoya una mano en el pecho y respirá.",
  mantra: "El Amor me sostiene.",
  category: "Calma"
},

// --- PERDÓN ---
{
  id: 12,
  phrase: "Elijo ver inocencia.",
  idea: "Perdonar es reconocer que el error nunca cambió la verdad.",
  action: "Pensá en alguien y decí: 'Tu esencia es buena'.",
  mantra: "Veo inocencia.",
  category: "Perdón"
},
{
  id: 13,
  phrase: "Nada que no sea amor es real.",
  idea: "Lo que perdonas nunca fue verdadero.",
  action: "Soltá un pensamiento de queja.",
  mantra: "Solo el amor es real.",
  category: "Perdón"
},
{
  id: 14,
  phrase: "Libero el pasado.",
  idea: "El perdón abre espacio para una nueva experiencia.",
  action: "Respirá y soltá una vieja historia.",
  mantra: "Estoy libre ahora.",
  category: "Perdón"
},
{
  id: 15,
  phrase: "Elijo la paz en lugar del juicio.",
  idea: "El juicio te ata; el perdón te libera.",
  action: "Detectá un juicio y dejalo ir.",
  mantra: "Elijo paz.",
  category: "Perdón"
},
{
  id: 16,
  phrase: "Mi mente es suave.",
  idea: "Una mente que perdona se vuelve liviana.",
  action: "Relajá la mandíbula y los hombros.",
  mantra: "Mi mente descansa.",
  category: "Perdón"
},

// --- PERCEPCIÓN ---
{
  id: 17,
  phrase: "Estoy dispuesto a ver diferente.",
  idea: "Cambiar tu mirada cambia tu mundo.",
  action: "Mirá algo cotidiano sin etiquetarlo.",
  mantra: "Veo con nuevos ojos.",
  category: "Percepción"
},
{
  id: 18,
  phrase: "La verdad me guía.",
  idea: "No todo lo que piensas es real.",
  action: "Cuestioná un pensamiento automático.",
  mantra: "Elijo claridad.",
  category: "Percepción"
},
{
  id: 19,
  phrase: "El Espíritu Santo interpreta por mí.",
  idea: "No necesitas entender todo, solo permitir una nueva interpretación.",
  action: "Decí: 'muéstrame otra manera'.",
  mantra: "Estoy abierto.",
  category: "Percepción"
},
{
  id: 20,
  phrase: "La luz revela la verdad.",
  idea: "La percepción cambia cuando eliges la luz.",
  action: "Mirá hacia una ventana o una luz.",
  mantra: "La luz me guía.",
  category: "Percepción"
},
{
  id: 21,
  phrase: "No soy mis pensamientos.",
  idea: "Eres quien observa, no lo observado.",
  action: "Observá un pensamiento sin seguirlo.",
  mantra: "Soy conciencia.",
  category: "Percepción"
},

// --- CONFIANZA ---
{
  id: 22,
  phrase: "Estoy guiado.",
  idea: "La vida no es al azar.",
  action: "Soltá el control por un momento.",
  mantra: "Confío.",
  category: "Confianza"
},
{
  id: 23,
  phrase: "Todo coopera para mi bien.",
  idea: "Incluso lo que parece difícil sirve al amor.",
  action: "Agradecé algo pequeño.",
  mantra: "Todo es ayuda.",
  category: "Confianza"
},
{
  id: 24,
  phrase: "Soy sostenido.",
  idea: "No cargas la vida solo.",
  action: "Respirá profundo.",
  mantra: "Estoy sostenido.",
  category: "Confianza"
},
{
  id: 25,
  phrase: "Confío en el plan.",
  idea: "La guía es constante.",
  action: "Soltá una preocupación.",
  mantra: "Estoy guiado.",
  category: "Confianza"
},
{
  id: 26,
  phrase: "La vida me cuida.",
  idea: "El amor te acompaña siempre.",
  action: "Sonreí a alguien.",
  mantra: "Estoy cuidado.",
  category: "Confianza"
},

// --- RELACIONES ---
{
  id: 27,
  phrase: "Elijo ver amor.",
  idea: "La relación es un aula de perdón.",
  action: "Escuchá sin interrumpir.",
  mantra: "Elijo amor.",
  category: "Relaciones"
},
{
  id: 28,
  phrase: "Somos uno.",
  idea: "No hay separación real.",
  action: "Deseá algo bueno a alguien.",
  mantra: "Somos uno.",
  category: "Relaciones"
},
{
  id: 29,
  phrase: "Veo tu luz.",
  idea: "La luz en ti reconoce la luz en otros.",
  action: "Agradecé una cualidad de alguien.",
  mantra: "Veo luz.",
  category: "Relaciones"
},
{
  id: 30,
  phrase: "No estoy solo.",
  idea: "Toda relación refleja unión.",
  action: "Enviá un mensaje amable.",
  mantra: "Estamos unidos.",
  category: "Relaciones"
},
{
  id: 31,
  phrase: "Elijo conexión.",
  idea: "El amor siempre une.",
  action: "Mirá a alguien con suavidad.",
  mantra: "Estoy en unión.",
  category: "Relaciones"
},

// --- PRESENCIA ---
{
  id: 32,
  phrase: "Este momento es suficiente.",
  idea: "Nada falta ahora.",
  action: "Respirá lento.",
  mantra: "Aquí es suficiente.",
  category: "Presencia"
},
{
  id: 33,
  phrase: "Solo ahora existe.",
  idea: "El ahora es donde vive la paz.",
  action: "Mirá tu respiración.",
  mantra: "Estoy aquí.",
  category: "Presencia"
},
{
  id: 34,
  phrase: "La vida sucede ahora.",
  idea: "No en el pasado ni en el futuro.",
  action: "Sentí tu cuerpo.",
  mantra: "Ahora.",
  category: "Presencia"
},
{
  id: 35,
  phrase: "Habito el presente.",
  idea: "La mente descansa aquí.",
  action: "Escuchá un sonido cercano.",
  mantra: "Estoy presente.",
  category: "Presencia"
},
{
  id: 36,
  phrase: "El ahora es santo.",
  idea: "Este instante es suficiente.",
  action: "Miralo todo con suavidad.",
  mantra: "Santo ahora.",
  category: "Presencia"
}
];
