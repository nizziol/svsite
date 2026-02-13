
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("betInput");
const dealBtn = document.getElementById("dealBtn");
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const doubleBtn = document.getElementById("doubleBtn");
const newRoundBtn = document.getElementById("newRoundBtn");
const messageEl = document.getElementById("message");

const dealerCardsEl = document.getElementById("dealerCards");
const playerCardsEl = document.getElementById("playerCards");
const dealerValueEl = document.getElementById("dealerValue");
const playerValueEl = document.getElementById("playerValue");

let balance = 1000;
let deck = [];
let dealerHand = [];
let playerHand = [];
let currentBet = 0;
let roundActive = false;
let playerStood = false;
let doubled = false;

balanceEl.textContent = balance;

function createDeck() {
  const suits = ["♠","♥","♦","♣"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const d = [];
  for (let s of suits) {
    for (let r of ranks) {
      d.push({suit:s, rank:r});
    }
  }
  let full = [];
  for (let i=0;i<6;i++) full = full.concat(d);
  return shuffle(full);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


function handValue(hand) {
  let value = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === "A") { aces++; value += 11; }
    else if (["K","Q","J"].includes(c.rank)) value += 10;
    else value += Number(c.rank);
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}


function renderHands(hideDealerSecond = true) {
  dealerCardsEl.innerHTML = "";
  playerCardsEl.innerHTML = "";

  dealerHand.forEach((c, idx) => {
    const el = createCardEl(c, (hideDealerSecond && idx===1));
    dealerCardsEl.appendChild(el);
  });

  playerHand.forEach(c => {
    playerCardsEl.appendChild(createCardEl(c, false));
  });

  dealerValueEl.textContent = hideDealerSecond ? "Wartość: ?" : "Wartość: " + handValue(dealerHand);
  playerValueEl.textContent = "Wartość: " + handValue(playerHand);
}


function createCardEl(card, hidden=false) {
  const div = document.createElement("div");
  div.className = "card";
  if (hidden) {
    div.innerHTML = `<div class="top">?</div><div class="mid">🂠</div><div class="bot">?</div>`;
    return div;
  }
  div.innerHTML = `<div class="top">${card.rank}${card.suit}</div><div class="mid">${card.rank}</div><div class="bot">${card.suit}</div>`;
  return div;
}

function resetRound() {
  if (!deck || deck.length < 52) deck = createDeck();
  dealerHand = [];
  playerHand = [];
  currentBet = 0;
  roundActive = false;
  playerStood = false;
  doubled = false;
  setButtonsState({deal:true, hit:false, stand:false, double:false, newRound:false});
  messageEl.textContent = "Wprowadź zakład i naciśnij Rozdaj.";
  renderHands(true);
}

function setButtonsState({deal, hit, stand, double, newRound}) {
  dealBtn.disabled = !deal;
  hitBtn.disabled = !hit;
  standBtn.disabled = !stand;
  doubleBtn.disabled = !double;
  newRoundBtn.disabled = !newRound;
}

dealBtn.addEventListener("click", () => {
  const bet = Math.floor(Number(betInput.value));
  if (!bet || bet <= 0) { messageEl.textContent = "Podaj poprawny zakład."; return; }
  if (bet > balance) { messageEl.textContent = "Brak wystarczających środków."; return; }

  currentBet = bet;
  balance -= bet;
  balanceEl.textContent = balance;

  roundActive = true;
  playerStood = false;
  doubled = false;
  if (!deck || deck.length < 52) deck = createDeck();

  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());

  renderHands(true);

  const playerVal = handValue(playerHand);
  const dealerVal = handValue(dealerHand);

  setButtonsState({deal:false, hit:true, stand:true, double: (playerHand.length===2), newRound:false});
  messageEl.textContent = "Twoja tura — Hit lub Stand. Możesz też Double (podwaja zakład).";

  if (playerVal === 21) {
    if (dealerVal === 21) {
      balance += currentBet;
      messageEl.textContent = "Push — obaj blackjack. Zakład zwrócony.";
      setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
      roundActive = false;
      renderHands(false);
      balanceEl.textContent = balance;
      return;
    } else {
      const win = Math.floor(currentBet * 1.5);
      balance += currentBet + win;
      messageEl.textContent = `Blackjack! Wygrałeś ${win} $.`;
      setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
      roundActive = false;
      renderHands(false);
      balanceEl.textContent = balance;
      return;
    }
  }
});

hitBtn.addEventListener("click", () => {
  if (!roundActive) return;
  playerHand.push(deck.pop());
  renderHands(true);

  const val = handValue(playerHand);
  if (val > 21) {
    messageEl.textContent = `Przegrałeś — bust (${val}).`;
    roundActive = false;
    setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
    renderHands(false);
  } else {
    setButtonsState({deal:false, hit:true, stand:true, double:false, newRound:false});
  }
});

standBtn.addEventListener("click", () => {
  if (!roundActive) return;
  playerStood = true;
  dealerPlay();
});

doubleBtn.addEventListener("click", () => {
  if (!roundActive) return;
  if (balance < currentBet) { messageEl.textContent = "Za mało środków by podwoić."; return; }
  balance -= currentBet;
  currentBet *= 2;
  doubled = true;
  balanceEl.textContent = balance;

  playerHand.push(deck.pop());
  renderHands(true);

  if (handValue(playerHand) > 21) {
    messageEl.textContent = `Bust po double (${handValue(playerHand)}). Przegrałeś.`;
    roundActive = false;
    setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
    renderHands(false);
    return;
  }
  dealerPlay();
});

function dealerPlay() {
  renderHands(false);

  while (handValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
    renderHands(false);
  }

  const playerVal = handValue(playerHand);
  const dealerVal = handValue(dealerHand);

  if (dealerVal > 21) {
    const win = currentBet * 2;
    balance += win;
    messageEl.textContent = `Dealer przebił (dealer ${dealerVal}). Wygrałeś ${currentBet} $.`;
  } else if (dealerVal > playerVal) {
    messageEl.textContent = `Przegrałeś. Dealer ${dealerVal} vs Ty ${playerVal}.`;
  } else if (dealerVal < playerVal) {
    const win = currentBet * 2;
    balance += win;
    messageEl.textContent = `Wygrałeś! Dealer ${dealerVal} vs Ty ${playerVal}. Zysk: ${currentBet} $.`;
  } else {
    balance += currentBet; 
    messageEl.textContent = `Push — remis (${playerVal}). Zakład zwrócony.`;
  }

  roundActive = false;
  setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
  renderHands(false);
  balanceEl.textContent = balance;
}

newRoundBtn.addEventListener("click", () => {
  playerHand = [];
  dealerHand = [];
  currentBet = 0;
  resetRound();
});

resetRound();

