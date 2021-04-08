/**
 * @typedef {Component}
 * @property {String} hookId - parent ID
 * @property {Boolean} isColliding
 * @property {Object} collision - a set of key- Boolean values indicating collision in all sides.
 * @function createRootElement -creates the wrapping element and sets classes, attributes and inline styles.
 * @param element - the outer-most element of any object
 * @function setInlineStyles
 * @method setInlineStyles()
 */
class Component {
  constructor(renderHookId) {
    this.hookId = renderHookId;
    this.collision = { top: false, bottom: false, left: false, right: false };
    this.isColliding = false;
  }
  createRootElement = (tag, cssClasses, styles, attributes) => {
    let rootElement = document.createElement(tag);
    if (cssClasses) rootElement.className = cssClasses;
    if (attributes) {
      for (const key in attributes) {
        rootElement.setAttribute(key, attributes[key]);
      }
    }
    this.setInlineStyles(rootElement, styles);
    document.getElementById(this.hookId).append(rootElement);
    this.element = rootElement;
    return rootElement;
  };
  render(value) {
    this.element.innerHTML = value;
  }
  /**
   * Sets inline styles to element from an object.
   * @param {HTMLElement} element
   * @param {Object} styles - format in key: value pair
   */
  setInlineStyles(element, styles) {
    for (const key in styles) {
      element.style[key] = styles[key];
    }
  }
  /**
   *
   * @param {HTMLElement} element
   */
  removeElement(element) {
    document.getElementById(this.hookId).removeChild(element);
  }
  removeAll() {
    document.getElementById('page-wrapper').innerHTML = '';
  }
}

/**
 * @method updateScoreBoard
 */
class HeaderElement extends Component {
  constructor() {
    super('page-wrapper');
    this.createRootElement('header', 'page-header', {}, { id: 'header' });
  }
  updateScoreBoard = (score, playedSets) => {
    this.render(
      `<div class="score-board">
      <div class="played-sets">set ( ${playedSets} / 10 )</div>
      <div class="score">Score: ${score}</div>
      </div>`
    );
  };
}
/**
 *
 */
class MainElement extends Component {
  constructor() {
    super('page-wrapper');
    this.createRootElement(
      'main',
      'gameplay-area',
      {},
      {
        id: 'gameplay-area',
      }
    );
  }
}
/**
 *
 */
class Modal extends Component {
  constructor() {
    super('gameplay-area');
    this.element = this.createRootElement(
      'div',
      'modal',
      { display: 'none' },
      {}
    );
  }
  showModal = () => {
    this.setInlineStyles(this.element, { display: 'block', id: 'asdasd' });
  };
  render = (content) => {
    this.showModal();
    this.element.innerHTML = `<div class="modal">
        <div class="modal-container">
            ${content}
        </div>
      </div>`;
  };
  hideModal = () => {
    this.setInlineStyles(this.element, { display: 'none' });
  };
}
/**
 *
 */
class Card extends Component {
  /**
   * @param {Number} index
   * @param {string} [cssClasses]
   * @param {Object} [styles={}]
   * @param {Object} [attributes={}]
   */
  constructor(index, cssClasses, styles, attributes) {
    super('gameplay-area');
    this.element = this.createRootElement(
      'div',
      cssClasses,
      styles,
      attributes
    );
    this.center = {};
    this.sides = {};
    this.size = {};
    this.getCoordnates();
  }
  /**
   * Converts the first letter to uppercase
   * @param {String} string
   * @returns {String}
   */
  nameToUpperCase(string) {
    return string.charAt(0).toUpperCase().concat(string.slice(1));
  }
  /**
   *
   */
  getCoordnates = () => {
    const {
      top,
      bottom,
      left,
      right,
      height,
      width,
    } = this.element.getBoundingClientRect();
    this.center.x = (left + right) / 2;
    this.center.y = (top + bottom) / 2;
    this.size = { height, width };
    this.sides = {
      top: top,
      bottom: bottom,
      left,
      right,
    };
  };
}

class FixedCard extends Card {
  /**
   *
   * @param {Number} index - Parent Id
   * @param {string} nationality
   * @param {string} position - position class, will be styled by css.
   */
  constructor(index, nationality, position, url) {
    const cssClasses = `box target-box ${position}`;
    const id = `nat-${nationality}`;
    super(index, cssClasses, {}, { id });
    this.nat = nationality;
    this.position = position;
    this.isClicked = false;
    this.render(`
    <img src=${url} class="flag" alt=${this.nameToUpperCase(this.nat)}/>
    <h3 class="name" >${this.nameToUpperCase(this.nat)}</h3>
    `);
  }
}

/**
 * @type {Element}
 * @method animate
 * @method showResultAnimation
 * @method animateToAnswerBox
 * @property {Boolean} isClicked -used when the object is being dragged
 * @property {Boolean} isPlaying
 * @method detectCollision sets isColliding and collision
 * @method checkCollisions checks for any object collisions, should be constantly called in the main loop
 *
 */
class MovingCard extends Card {
  constructor(image) {
    const defaultStyles = {
      width: '150px',
      height: '200px',
      top: '0px',
      left: '40%',
      backgroundImage: `url(${image.url})`,
      backgroundSize: 'cover',
    };
    const defaultAttributes = {
      id: 'picture-frame',
    };
    super(1, 'box border-grad', defaultStyles, defaultAttributes);
    this.isClicked = false;
    this.isPlaying = false;
    this.accumulator = 0;
    this.nationality = image.nationality;
  }

  animate = () => {
    this.moveBox();
    if (this.isPlaying) {
      window.requestAnimationFrame(this.animate);
    } else {
      window.cancelAnimationFrame(this.animate);
    }
  };
  showResultAnimation = (result) => {
    this.setInlineStyles(this.element, {
      transform: 'scale(0.5)',
      borderColor: `${result ? 'green' : 'red'}`,
      borderWidth: '20px',
      opacity: 0,
      transition: 'all 1s ease-out',
    });
  };
  /**
   *
   * @param {FixedCard} card
   */
  animateToAnswerBox = (card) => {
    this.setInlineStyles(this.element, {
      top: `${card.center.y - this.size.height / 2}px`,
      left: `${card.center.x - this.size.width / 2}px`,
      transform: `scale(${card.size.height / this.size.height})`,
      transition: 'all 0.6s ease-out',
      animationPlayState: 'paused',
    });
  };
  /**
   *
   * @param {Number} [step=2] step in pixels
   */
  moveBox = (step = 1) => {
    this.accumulator = this.accumulator + step;
    if (!this.isClicked && this.isPlaying) {
      this.setInlineStyles(this.element, {
        top: `${this.sides.top + this.accumulator}px`,
        left: `${this.sides.left}px`,
      });
      this.getCoordnates();
      this.accumulator = 0;
    }
  };
}
/**+
 * The main class of the game, contains most of the logic
 * @function handleMouseEvents
 * @property {Number} score
 * @property {Number} playedSets
 * @param {object[]} images -an array of objects, will be passed to createGameWorld
 * @method detectCollision
 * @method createGameWorld
 * @function updateGameWorld
 * @method startSet instantiates each set of thr game.
 * @method clearGameWorld cleans unnecessary elements after each set.
 *
 *
 */
class Game extends Component {
  /**
   *
   * @param {Object} cardsList
   */
  constructor() {
    super('page-wrapper');
    this.score = 0;
    this.playedSets = 0;
    this.images = [];
    this.currentImageIndex = 0;
  }
  /**
   *
   * @param {HTMLElement} target
   */
  #handleMouseEvents(target) {
    let start,
      movementX = 0,
      movementY = 0,
      selectedAnswer = '';
    target.element.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      start = [ev.layerX, ev.layerY];
      target.isClicked = true;
    });
    target.element.addEventListener('pointerup', (ev) => {
      ev.preventDefault();
      target.isClicked = false;
    });
    target.element.addEventListener('pointermove', (ev) => {
      if (target.isClicked) {
        ev.preventDefault();
        const left = ev.clientX - start[0];
        const top = ev.clientY - start[1];
        movementX += ev.movementX;
        movementY += ev.movementY;
        if (
          (movementX !== 0 && movementY !== 0 && Math.abs(movementX) > 20) ||
          Math.abs(movementY) > 20
        ) {
          // target.isClicked = false;
          if (movementX > 0) {
            if (movementY > 0) {
              selectedAnswer = 'bottom-right';
            } else {
              selectedAnswer = 'top-right';
            }
          } else {
            if (movementY > 0) {
              selectedAnswer = 'bottom-left';
            } else {
              selectedAnswer = 'top-left';
            }
          }
          const selectedElement = this.fixedCards.filter(
            (item) => item.position === selectedAnswer
          )[0];
          this.movingCard.animateToAnswerBox(selectedElement);
          setTimeout(this.checkAnswer, 600, selectedElement);
          target.isClicked = false;
          target.isPlaying = false;
        } else {
          target.setInlineStyles(target.element, {
            top: top + 'px',
            left: left + 'px',
          });
        }
      }
    });
  }
  /**
   * checks if the two objects are colliding, returns false if not and an array of colliding side names otherwise.
   * @param {HTMLElement} target1
   * @param {HTMLElement} traget2
   * @returns {Boolean}
   */
  detectCollision = (target1, target2) => {
    const distanceVector = {},
      minDistance = {};
    distanceVector.x = target1.center.x - target2.center.x;
    distanceVector.y = target1.center.y - target2.center.y;
    minDistance.x = (target1.size.width + target2.size.width) / 2;
    minDistance.y = (target1.size.height + target2.size.height) / 2;
    const checkLeftRight = () => {
      if (distanceVector.x > 0) {
        // Target 2 is at the left side of target 1
        target1.collision.right = true;
        target2.collision.left = true;
      } else {
        target1.collision.left = true;
        target2.collision.right = true;
      }
    };
    const checkTopBottom = () => {
      if (distanceVector.y > 0) {
        // Target 2 is above target 1
        target1.collision.top = true;
        target2.collision.bottom = true;
      } else {
        // Target 2 is below target 1
        target1.collision.bottom = true;
        target2.collision.top = true;
      }
    };
    if (
      Math.abs(distanceVector.x) > minDistance.x ||
      Math.abs(distanceVector.y) > minDistance.y
    ) {
      // No collision, any other case will indicate collision.
      target1.isColliding = false;
      target2.isColliding = false;
      return false;
    } else if (Math.abs(distanceVector.x) === minDistance.x) {
      // Collision at left or right side.
      checkLeftRight();
    } else if (Math.abs(distanceVector.y) === minDistance.y) {
      // Collision at top or bottom side.
      checkTopBottom();
    } else {
      // Collision at more than one side
      checkTopBottom();
      checkLeftRight();
    }
    target1.isColliding = true;
    target2.isColliding = true;
    return true;
  };
  checkCollisions = () => {
    this.detectCollision(this.movingCard, this.fixedCards[0]);
    this.detectCollision(this.movingCard, this.bottomLine);
  };
  checkAnswer = (selectedElement) => {
    const result = selectedElement.nat === this.movingCard.nationality;
    this.setScore(result ? 20 : -5);
    this.movingCard.showResultAnimation(result);
    setTimeout(this.clearGameWorld, 1000);
  };
  /**
   *
   */
  createGameWorld = (images, resetHandler) => {
    const cardsList = [
      {
        nat: 'japanese',
        position: 'top-left',
        url: 'images/flags/japan_flag.png',
      },
      {
        nat: 'chineese',
        position: 'top-right',
        url: 'images/flags/china_flag.png',
      },
      { nat: 'korean', position: 'bottom-left', url: 'images/flags/korea.png' },
      {
        nat: 'thai',
        position: 'bottom-right',
        url: 'images/flags/thailand.png',
      },
    ];
    this.resetHandler = resetHandler;
    this.main = new MainElement();
    this.header = new HeaderElement();
    this.fixedCards = cardsList.map(
      (card, index) => new FixedCard(index, card.nat, card.position, card.url)
    );
    this.bottomLine = new Card(
      0,
      'bottom-line',
      { bottom: '0px', left: '0px' },
      { id: 'line' }
    );
    this.images = images;
    console.log(this.images);
    this.modal = new Modal();
  };
  updateGameWorld = () => {
    if (this.movingCard.isPlaying) {
      this.movingCard.getCoordnates();
      this.checkCollisions();
      if (this.bottomLine.isColliding) {
        this.movingCard.isPlaying = false;
        this.checkAnswer(false);
      }
    }
  };
  clearGameWorld = () => {
    this.movingCard.isPlaying = false;
    this.movingCard.removeElement(this.movingCard.element);
    if (this.playedSets >= 10) {
      this.displayResults();
    } else {
      this.startSet();
    }
  };
  startSet = () => {
    this.playedSets += 1;
    const image = this.images.shift();
    this.movingCard = new MovingCard(image);
    this.#handleMouseEvents(this.movingCard);
    this.movingCard.isPlaying = true;
    window.requestAnimationFrame(this.movingCard.animate);
  };
  setScore = (score) => {
    this.score += score;
    this.header.updateScoreBoard(this.score, this.playedSets);
  };
  displayResults = () => {
    this.removeAll();
    reset(this.score);
    this.score = 0;
    this.playedSets = 0;
  };
}

const game = new Game();
const shuffle = [
  { nationality: 'japanese', url: 'images/japan17.jpeg' },
  { nationality: 'korean', url: 'images/korea8.jpeg' },
  { nationality: 'chineese', url: 'images/chin2.jpg' },
  { nationality: 'chineese', url: 'images/chin9.jpg' },
  { nationality: 'korean', url: 'images/korea1.jpeg' },
  { nationality: 'japanese', url: 'images/japan20.jpg' },
  { nationality: 'japanese', url: 'images/japan10.jpg' },
  { nationality: 'thai', url: 'images/thai8.jpg' },
  { nationality: 'japanese', url: 'images/japan14.jpg' },
  { nationality: 'chineese', url: 'images/chin1.jpg' },
  { nationality: 'chineese', url: 'images/chin11.jpg' },
  { nationality: 'japanese', url: 'images/japan8.jpg' },
  { nationality: 'chineese', url: 'images/chin13.jpg' },
  { nationality: 'japanese', url: 'images/japan20.jpg' },
  { nationality: 'japanese', url: 'images/japan6.jpg' },
  { nationality: 'chineese', url: 'images/chin16.jpg' },
  { nationality: 'thai', url: 'images/thai10.jpg' },
  { nationality: 'japanese', url: 'images/japan4.jpg' },
  { nationality: 'korean', url: 'images/korea3.jpeg' },
  { nationality: 'thai', url: 'images/thai4.jpg' },
  { nationality: 'japanese', url: 'images/japan20.jpg' },
  { nationality: 'thai', url: 'images/thai1.jpg' },
  { nationality: 'thai', url: 'images/thai13.png' },
  { nationality: 'japanese', url: 'images/japan16.jpg' },
  { nationality: 'chineese', url: 'images/chin6.jpg' },
  { nationality: 'korean', url: 'images/korea6.jpeg' },
  { nationality: 'thai', url: 'images/thai6.jpg' },
  { nationality: 'japanese', url: 'images/japan11.jpeg' },
  { nationality: 'japanese', url: 'images/japan9.jpg' },
  { nationality: 'chineese', url: 'images/chin4.jpeg' },
];
const reset = (score = null) => {
  console.log(shuffle);
  game.createGameWorld(shuffle, reset);
  game.modal.showModal();
  if (score) {
    game.modal.render(`
      <div class="form-wrapper">
        <h1 class="">Well Done!</h1>
        <h2 class="decription">You gained ${score} scores.</h2>
        <button id='start-button' class="button-start">Retry</button>
      </div>
    `);
  } else {
    game.modal.render(`
      <div class="form-wrapper">
        <h1 class="welcome">Welcome</h1>
        <h2 class="decription">Please hit start to begin!</h2>
        <button id='start-button' class="button-start">start</button>
      </div>
    `);
  }
  game.modal.element
    .querySelector('#start-button')
    .addEventListener('click', () => {
      game.modal.hideModal();
      game.startSet();
      setInterval(() => {
        game.updateGameWorld();
      }, 100);
    });
};

reset();
