const { fromEvent, combineLatest, interval } = rxjs;
const operator = rxjs.operators;

const empty = 0;
const player1 = 1;
const player2 = 4;
const invader = 2;
const shot = 3;
const noOfInvadersRows = 6;


const gameObject = (x, y) => ({ x: x, y: y });
const gameSize = 20;
const clearGame = () =>
  Array(gameSize)
    .fill(empty)
    .map(e => Array(gameSize).fill(empty));

const createInvaders = () =>
  Array.from(Array(noOfInvadersRows).keys()).reduce(
    (invds, row) => [...invds, ...createRowOfInvaders(row)],
    []
  );
const createRowOfInvaders = row =>
  Array.from(Array(gameSize / 2).keys())
    .filter(e => (row % 2 === 0 ? e % 2 === 0 : e % 2 !== 0))
    .map(e => gameObject(row, e + 4));

const invadersDirection = (state) =>
  state.invaders.length && state.invaders[0].y <= 0
    ? 1
    : state.invaders.length &&
      state.invaders[state.invaders.length - 1].y >= gameSize - 1
    ? -1
    : state.invadersDirY;

const drawGame = (state) => (
  keepShipWithinGame(state),
  keepShipZWithinGame(state),
  (state.game = clearGame()),
  (state.game[state.game.length - 1][state.shipY] = player1),
  (state.game[state.game.length - 1][state.shipZ] = player2),
  state.invaders.forEach(i => (state.game[i.x][i.y] = invader)),
  state.invadersShoots.forEach(s => (state.game[s.x][s.y] = shot)),
  state.shoots.forEach(s => (state.game[s.x][s.y] = shot)),
  state.game
);

const addInvaderShoot = state =>
  (randomInvader => gameObject(randomInvader.x, randomInvader.y))(
    state.invaders[Math.floor(Math.random() * state.invaders.length)]
  );

const collision = (e1, e2) => e1.x === e2.x && e1.y === e2.y;

const filterOutCollisions = (c1, c2) =>
  c1.filter(e1 => !c2.find(e2 => collision(e1, e2)));

const updateScore = (state) =>
  state.shoots.find(s => state.invaders.find(i => collision(s, i)))
    ? state.score + 1
    : state.score;

const updateState = (state) => ({
  delta: state.delta,
  game: drawGame(state),
  shipY: state.shipY,
  shipZ: state.shipZ,
  playerLives: state.invadersShoots.some(
    e => e.x === gameSize - 1 && (e.y === state.shipY || e.y === state.shipZ)
  )
    ? state.playerLives - 1
    : state.playerLives,
  isGameOver: state.playerLives <= 0,
  score: updateScore(state),
  invadersDirY: invadersDirection(state),
  invaders: !state.invaders.length
    ? createInvaders()
    : filterOutCollisions(state.invaders, state.shoots).map(i =>
        state.delta % 10 === 0
          ? gameObject(
              i.x + (state.delta % (state.shootFrequency + 10) === 0 ? 1 : 0),
              i.y + state.invadersDirY
            )
          : i
      ),
  invadersShoots:
    ((state.invadersShoots =
      state.delta % state.shootFrequency === 0
        ? [...state.invadersShoots, addInvaderShoot(state)]
        : state.invadersShoots),
    state.invadersShoots
      .filter(e => e.x < gameSize - 1)
      .map(e => gameObject(e.x + 1, e.y))),
  shoots: filterOutCollisions(state.shoots, state.invaders)
    .filter(e => e.x > 0)
    .map(e => gameObject(e.x - 1, e.y)),
  shootFrequency: !state.invaders.length
    ? state.shootFrequency - 5
    : state.shootFrequency
});

const keepShipWithinGame = (state)=> (
  (state.shipY = state.shipY < 0 ? 0 : state.shipY),
  (state.shipY = state.shipY >= gameSize - 1 ? gameSize - 1 : state.shipY)
);


const keepShipZWithinGame = (state)=> (
  (state.shipZ = state.shipZ < 0 ? 0 : state.shipZ),
  (state.shipZ = state.shipZ >= gameSize - 1 ? gameSize - 1 : state.shipZ)
);

const updateShipY = (state, input)=>{
  input.key !== 'ArrowLeft' && input.key !== 'ArrowRight'
    ? state.shipY
    : (state.shipY -= input.key === 'ArrowLeft' ? 1 : -1);
 input.key !== 'KeyA' && input.key !== 'KeyD'
    ? state.shipZ
    : (state.shipZ-= input.key === 'KeyA' ? 1 : -1); 
  };

const addShots = (state, input) =>{
  (state.shoots =
    input.key === 'ArrowUp'
      ? [...state.shoots, gameObject(gameSize - 2, state.shipY)]
      : state.shoots),
    (state.shoots =
    input.key === 'KeyW'
      ? [...state.shoots, gameObject(gameSize - 2, state.shipZ)]
      : state.shoots)
    };

const isGameOver = (state) =>
  state.playerLives <= 0 ||
  (state.invaders.length &&
    state.invaders[state.invaders.length - 1].x >= gameSize - 1);

const initialState = {
  delta: 0,
  game: clearGame(),
  shipY: 10,
  shipZ: 20,
  playerLives: 3,
  isGameOver: false,
  score: 0,
  invadersDirY: 1,
  invaders: createInvaders(),
  invadersShoots: [],
  shoots: [],
  shootFrequency: 20
};

const processInput = (state, input) => (
  updateShipY(state, input), addShots(state, input)
);
const whileNotGameOver = (state, input) =>
  (state.delta = isGameOver(state) ? undefined : input.dlta);

const gameUpdate = (state, input) => (
  whileNotGameOver(state, input), processInput(state, input), updateState(state)
);


const createElem = col => {
  const elem = document.createElement('div');
  elem.classList.add('board');
  elem.style.display = 'inline-block';
  elem.style.marginLeft = '10px';
  elem.style.height = '6px';
  elem.style.width = '6px';
  elem.style['background-color'] =
    col === empty
      ? 'white'
      : col === player1
      ? 'cornflowerblue'
      : col == player2
      ? 'red'
      : col === invader
      ? 'gray'
      : 'silver';
  elem.style['border-radius'] = '90%';
  return elem;
};

const paint = (
  game,
  playerLives,
  score,
  isGameOver,
) => {
  document.body.innerHTML = '';
  document.body.innerHTML += `Score: ${score} Lives: ${playerLives}`;

  if (isGameOver) {
    document.body.innerHTML += ' GAME OVER!';
    return;
  }

  game.forEach(row => {
    const rowContainer = document.createElement('div');
    row.forEach(col => rowContainer.appendChild(createElem(col)));
    document.body.appendChild(rowContainer);
  });
};


const spaceInvaders$ = interval(100).pipe(
  operator.withLatestFrom(
    fromEvent(document, 'keydown').pipe(
      operator.startWith({ code: '' }),
      operator.takeUntil(fromEvent(document, 'keyup')),
      operator.repeat()
    )
  ),
  operator.map(([intrvl, event])=> ({
    dlta: intrvl,
    key: event.code
  })),
  operator.scan(gameUpdate, initialState),
  operator.tap(e => paint(e.game, e.playerLives, e.score, e.isGameOver))
);

spaceInvaders$.subscribe();
