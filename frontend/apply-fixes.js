const fs = require("fs");
// 1) package.json
const pj = "package.json";
const d = JSON.parse(fs.readFileSync(pj, "utf8"));
const deps = d.dependencies || {};
deps["react-native-screens"] = "~4.16.0";
deps["react-native-maps"] = "1.20.1";
deps["react-native-reanimated"] = "~4.1.1";
deps["react-native-worklets"] = "0.5.1";
delete deps["react-persist"];
d.dependencies = Object.fromEntries(Object.entries(deps).sort());
d.devDependencies = d.devDependencies || {};
d.devDependencies["babel-preset-expo"] = "^54.0.0";
fs.writeFileSync(pj, JSON.stringify(d, null, 2) + "\n");
console.log("[ok] package.json");

// 2) app.json — retire le faux plugin react-native-maps
const aj = "app.json";
const a = JSON.parse(fs.readFileSync(aj, "utf8"));
a.expo.plugins = (a.expo.plugins || []).filter(
  (p) => !(Array.isArray(p) && p[0] === "react-native-maps") && p !== "react-native-maps"
);
fs.writeFileSync(aj, JSON.stringify(a, null, 2) + "\n");
console.log("[ok] app.json");

// 3) babel.config.js — reanimated 4 utilise le plugin worklets
const bj = "babel.config.js";
let s = fs.readFileSync(bj, "utf8");
if (!s.includes("react-native-worklets/plugin")) {
  s = s.replace("react-native-reanimated/plugin", "react-native-worklets/plugin");
  fs.writeFileSync(bj, s);
}
console.log("[ok] babel.config.js");
console.log("Termine. Lance maintenant : npm install");
