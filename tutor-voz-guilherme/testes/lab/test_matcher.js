const { compare } = require("./static/matcher.js");
let fail = 0;
function t(heard, act, want) {
  const r = compare(heard, act);
  const ok = r.status === want;
  if (!ok) fail++;
  console.log(`${ok ? "OK  " : "FALHA"} alvo=${act.target.padEnd(8)} ouvido=${JSON.stringify(heard).padEnd(26)} -> ${r.status.padEnd(7)} (${r.how}, ${r.score.toFixed(2)}) esperado=${want}`);
}
const bola = { target: "bola" };
t("bola", bola, "correct");
t("Bola!", bola, "correct");
t("é a bola", bola, "correct");
t("eu falei bola", bola, "correct");
t("bolas", { target: "bola", accept: ["bolas"] }, "correct");
t("bóla", bola, "correct");
t("bolo", bola, "close");        // bolo é outra palavra, mas perto: pedir de novo
t("cachorro", bola, "wrong");
t("é", bola, "silence");
t("hum", bola, "silence");
t("", bola, "silence");
const ball = { target: "ball", asrAliases: ["bol", "bou", "bau"] };
t("ball", ball, "correct");
t("bol", ball, "correct");        // alias
t("bau", ball, "correct");
t("bola", ball, "close");         // disse em português: não é erro, é "quase"
t("dog", ball, "wrong");
const car = { target: "car", asrAliases: ["car", "cá", "carro"] };
t("car", car, "correct");
t("kar", car, "correct");         // fonética k/c
t("the car", car, "correct");
t("cat", car, "close");
const red = { target: "red" };
t("hed", red, "close");
t("ted", red, "close");
t("blue", red, "wrong");
const purple = { target: "purple", asrAliases: ["porpou", "perpou", "purpou"] };
t("purple", purple, "correct");
t("porpou", purple, "correct");
t("pouple", purple, "wrong");
const phrase = { target: "red car" };
t("a red car", phrase, "correct");
t("redcar", phrase, "correct");
t("red", phrase, "wrong");
console.log(fail ? `\n${fail} falha(s)` : "\ntudo certo");
process.exit(fail ? 1 : 0);
