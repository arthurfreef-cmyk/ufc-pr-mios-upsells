import alca from "@/assets/quiz/alcaufc.png.asset.json";
import brasil from "@/assets/quiz/brasil.png.asset.json";
import casabranca from "@/assets/quiz/casabranca.png.asset.json";
import charles from "@/assets/quiz/charles.png.asset.json";
import conor from "@/assets/quiz/conor.png.asset.json";
import inox from "@/assets/quiz/copoexufc.png.asset.json";
import jon from "@/assets/quiz/jonjones.png.asset.json";
import khabib from "@/assets/quiz/khabibufc.png.asset.json";
import vegas from "@/assets/quiz/lasvegas.png.asset.json";
import ny from "@/assets/quiz/novay.png.asset.json";
import tampa from "@/assets/quiz/tampaufc.png.asset.json";
import copo from "@/assets/copo.png";

/** Opção do quiz; `img` opcional mostra uma foto no cartão. */
export interface QuizOption { label: string; img?: string }
/** Perguntas do quiz. Só personalizam a página: não liberam prêmio nem desconto. */
export interface QuizQuestion { kicker: string; text: string; options: readonly QuizOption[] }
const t = (...l: string[]): QuizOption[] => l.map((label) => ({ label }));

export const QUIZ: readonly QuizQuestion[] = [
  { kicker: "ROTINA", text: "Sua bebida esquenta antes de você terminar?", options: t("Sim, sempre", "Não, eu bebo rápido") },
  { kicker: "DIA A DIA", text: "Onde o copo ia te salvar mais?", options: t("Na academia", "No trabalho", "No carro", "Na rua") },
  { kicker: "LUTADOR", text: "Qual é o seu lutador favorito?", options: [
    { label: "Jon Jones", img: jon.url }, { label: "Charles do Bronx", img: charles.url },
    { label: "Khabib Nurmagomedov", img: khabib.url }, { label: "Conor McGregor", img: conor.url }] },
  { kicker: "CIDADE", text: "Qual é o lugar que você mais gosta de ver UFC?", options: [
    { label: "Las Vegas", img: vegas.url }, { label: "Nova York", img: ny.url },
    { label: "Casa Branca", img: casabranca.url }, { label: "Brasil", img: brasil.url }] },
  { kicker: "HOJE", text: "Quanto tempo o gelo dura no copo que você usa hoje?", options: t("Menos de 1 hora", "Uma manhã", "O dia todo", "Não uso copo") },
  { kicker: "DETALHES", text: "Qual detalhe do copo você mais gostou?", options: [
    { label: "Tampa com canudo", img: tampa.url }, { label: "Inox por dentro", img: inox.url },
    { label: "Chaveiro na alça", img: alca.url }, { label: "O copão", img: copo }] },
  { kicker: "JÁ ACONTECEU", text: "Já vazou bebida dentro da sua mochila?", options: t("Já, mais de uma vez", "Nunca") },
  { kicker: "TAMANHO", text: "Qual tamanho combina com o seu dia?", options: t("500 ml", "1 litro", "1,15 litros", "Quanto maior, melhor") },
  { kicker: "ÚLTIMA", text: "Como você encheria o copo no primeiro dia?", options: t("Energético gelado", "Água com gelo", "Café gelado", "Suco ou isotônico") },
];
