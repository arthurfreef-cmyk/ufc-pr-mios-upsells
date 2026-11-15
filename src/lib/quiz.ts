/** Perguntas do quiz. Só personalizam a página: não liberam prêmio nem desconto. */
export interface QuizQuestion { kicker: string; text: string; options: readonly string[] }
export const QUIZ: readonly QuizQuestion[] = [
  { kicker: "ROTINA", text: "Sua bebida esquenta antes de você terminar?", options: ["Sim, sempre", "Não, eu bebo rápido"] },
  { kicker: "DIA A DIA", text: "Onde o copo ia te salvar mais?", options: ["Na academia", "No trabalho", "No carro", "Na rua"] },
  { kicker: "LUTADOR", text: "Qual é o seu lutador favorito?", options: ["Jon Jones", "Charles do Bronx", "Khabib Nurmagomedov", "Conor McGregor"] },
  { kicker: "CIDADE", text: "Onde você mais gostaria de assistir uma luta?", options: ["Las Vegas", "Nova York", "Austrália", "Brasil"] },
  { kicker: "HOJE", text: "Quanto tempo o gelo dura no copo que você usa hoje?", options: ["Menos de 1 hora", "Uma manhã", "O dia todo", "Não uso copo"] },
  { kicker: "DETALHES", text: "Qual detalhe do copo você mais gostou?", options: ["Tampa com canudo", "Inox por dentro", "Chaveiro na alça", "O copão"] },
  { kicker: "JÁ ACONTECEU", text: "Já vazou bebida dentro da sua mochila?", options: ["Já, mais de uma vez", "Nunca"] },
  { kicker: "TAMANHO", text: "Qual tamanho combina com o seu dia?", options: ["500 ml", "1 litro", "1,15 litros", "Quanto maior, melhor"] },
  { kicker: "ÚLTIMA", text: "Como você encheria o copo no primeiro dia?", options: ["Energético gelado", "Água com gelo", "Café gelado", "Suco ou isotônico"] },
];
