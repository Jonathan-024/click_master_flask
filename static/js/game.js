// Vérifie que le joueur est bien passé par START
if (sessionStorage.getItem("gameStarted") !== "true") {
  window.location.href = "/";
}
sessionStorage.removeItem("gameStarted");

// Variables principales
let score = 0,
    faults = 0,
    level = 1,
    vitesse = 2500,
    blocActif = null,
    timerBloc;

const couleurs = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];
const FAUTES_MAX = 10;
const NIVEAUX = [
  { temps: 0, vitesse: 2500 },
  { temps: 30, vitesse: 2000 },
  { temps: 60, vitesse: 1500 },
  { temps: 90, vitesse: 1000 },
  { temps: 120, vitesse: 500 }
];

// Sélecteurs DOM
const scoreDisplay = document.getElementById("score");
const faultsDisplay = document.getElementById("faults");
const levelDisplay = document.getElementById("level");
const gameArea = document.getElementById("gameArea");
const soundCorrect = document.getElementById("soundCorrect");
const soundWrong = document.getElementById("soundWrong");

// Modale
const endModal = document.getElementById("endModal");
const finalScoreEl = document.getElementById("finalScore");
const playerNameInput = document.getElementById("playerName");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const modalScoreTable = document.getElementById("modalScoreTable");

// Génération des 9 blocs
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.id = i;
  cell.addEventListener("click", () => clicBloc(i));
  gameArea.appendChild(cell);
}
const cells = document.querySelectorAll(".cell");

// Mapping clavier
const touchesMap = {
  'a':0, '7':0, 'z':1, '8':1, 'e':2, '9':2,
  'q':3, '4':3, 's':4, '5':4, 'd':5, '6':5,
  'w':6, '1':6, 'x':7, '2':7, 'c':8, '3':8
};
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (touchesMap.hasOwnProperty(key)) {
    clicBloc(touchesMap[key]);
  }
});

// Mise à jour HUD
function majAffichage() {
  scoreDisplay.textContent = `SC : ${score.toString().padStart(3, '0')}`;
  faultsDisplay.textContent = `F : ${faults}/${FAUTES_MAX}`;
  levelDisplay.textContent = `NV : ${level.toString().padStart(2, '0')}`;
}

// Choisir un bloc et une couleur aléatoire
function choisirBlocAleatoire() {
  cells.forEach(c => {
    c.classList.remove('active');
    c.style.background = '#ccc';
  });
  const index = Math.floor(Math.random() * cells.length);
  const couleur = couleurs[Math.floor(Math.random() * couleurs.length)];
  cells[index].classList.add('active');
  cells[index].style.background = couleur;
  blocActif = index;
}

// Clic ou touche clavier sur un bloc
function clicBloc(index) {
  if (index === blocActif) {
    score++;
    soundCorrect.currentTime = 0;
    soundCorrect.play();
    flash(index, 'correct');
    blocActif = null;
  } else {
    faults++;
    soundWrong.currentTime = 0;
    soundWrong.play();
    flash(index, 'wrong');
    if (faults >= FAUTES_MAX) {
      finPartie();
    }
  }
  majAffichage();
}

// Effet visuel
function flash(index, type) {
  const bloc = cells[index];
  bloc.classList.add(type);
  setTimeout(() => bloc.classList.remove(type), 300);
}

// Boucle principale
function boucleBloc() {
  choisirBlocAleatoire();
  majNiveau();
  timerBloc = setTimeout(boucleBloc, vitesse);
}

// Mise à jour du niveau et de la vitesse
function majNiveau() {
  const tempsEcoule = (Date.now() - tempsDepart) / 1000;
  for (let i = NIVEAUX.length - 1; i >= 0; i--) {
    if (tempsEcoule >= NIVEAUX[i].temps) {
      level = i + 1;
      vitesse = NIVEAUX[i].vitesse;
      break;
    }
  }
  majAffichage();
}

// Sauvegarde du meilleur score local
function sauvegarderMeilleurScoreLocal(sc) {
  const best = localStorage.getItem("bestScore") || 0;
  if (sc > best) {
    localStorage.setItem("bestScore", sc);
  }
}

// Fin de partie avec modale
function finPartie() {
  clearTimeout(timerBloc);
  sauvegarderMeilleurScoreLocal(score);

  finalScoreEl.textContent = score;
  endModal.style.display = "flex";

  saveScoreBtn.onclick = () => {
    const nom = playerNameInput.value.trim() || "Anonyme";
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nom, score: score })
    })
    .then(res => res.json())
    .then(data => {
      modalScoreTable.innerHTML = "";
      data.scores.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${s.name}</td><td>${s.score}</td>`;
        modalScoreTable.appendChild(tr);
      });
      saveScoreBtn.disabled = true;
    })
    .catch(err => console.error("Erreur envoi score :", err));
  };
}

// Lancement du jeu
const tempsDepart = Date.now();
majAffichage();
boucleBloc();