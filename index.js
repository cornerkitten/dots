// TODO
//  - Add cell capturing (consider having something collected from the center)
// DONE
//  - Refactor state logic
//  - Refresh h-line component when state changes for $store.state.hLines
//  - Fix required vs isRequired on component props (should be required)
// THANKS
//  - Confetti implementation inspired from "CSS Particle Effects" pen
//    by Atticus Koya (https://codepen.io/k-ya/pen/bpxgWZ)

const DOT_COUNT = 4;

document.addEventListener('touchstart', () => {}, true);


Vue.component('confetti', {
  template: `
    <div class="confetti-root">
      <confetti-piece v-for="n in 100"></confetti-piece>
    </div>
  `,
});

Vue.component('confetti-piece', {
  data() {
    let colors = [
      '#0066cc',
      'orange',
      'pink',
    ];

    let left = (Math.random() * 100 - 50) + 'vw';
    let animationDuration = (Math.random() * 2500 + 1500) + 'ms';
    let animationDelay = (Math.random() * 1000) + 'ms';

    let colorIndex = Math.floor(Math.random() * colors.length);
    let backgroundColor = colors[colorIndex];
    // confetti.style.boxShadow = '0 0 5px ' + colors[colorIndex];
    
    return {
      style: {
        animationDelay,
        animationDuration,
        backgroundColor,
        left,
      },
    };
  },
  template: `
    <div class="confetti" v-bind:style="style"></div>
  `,
});

Vue.component('overview', {
  computed: {
    winStatus() {
      const winnerId = this.$store.getters.winner;

      if (winnerId === 0) {
        let firstPlayerName = this.$store.getters.playerName(1);
        let secondPlayerName = this.$store.getters.playerName(2);
        return `${firstPlayerName} & ${secondPlayerName} Tie`;
      } else {
        let winnerName = this.$store.getters.playerName(winnerId);
        return `${winnerName} Wins`;
      }
    },
    isPlaying() {
      // console.info('isPlaying', (this.$store.getters.winner === null));
      return (this.$store.getters.winner === null);
    },
    scores() {
      return {
        1: this.$store.state.scores[1],
        2: this.$store.state.scores[2],
      }
    }
  },
  template: `
    <div class="overview">
      <template v-if="isPlaying">
        <div class="players">
          <player :player-id="1"></player>
          <player :player-id="2"></player>
        </div>
      </template>
      <template v-else>
        <confetti></confetti>
        <div class="status">
          {{ winStatus }}
        </div>
      </template>
    </div>
  `,
});

Vue.component('player', {
  props: {
    // playerName: {
    //   type: String,
    //   required: true,
    // },
    playerId: {
      type: Number,
      required: true,
    }
  },
  computed: {
    isCurrentPlayer() {
      return this.$store.state.currentPlayer === this.playerId;
    },
    score() {
      // console.info('playerId', this.playerId);
      return this.$store.state.scores[this.playerId];
    },
    name() {
      return this.$store.getters.playerName(this.playerId);
    },
  },
  // data() {
  //   return {
  //     classes: {
  //       'current-player': this.currentPlayer === this.playerId,
  //     },
  //   };
  // },
  template: `
    <div class="player" v-bind:class="{ 'current-player': isCurrentPlayer }">
      <div class="name">{{ name }}</div>
      <div class="score">{{ score }}</div>
    </div>
  `,
});

Vue.component('dot', {
  props: {
    col: {
      type: Number,
      required: true,
    },
    row: {
      type: Number,
      required: true,
    },
  },
  computed: {
    isSelected() {
      return this.$store.getters.isSelectedDot({
        row: this.row, col: this.col
      });
    },
  },
  methods: {
    select: function(event) {
      this.$store.dispatch({
        type: 'actOnDot',
        row: this.row,
        col: this.col,
      });
    },
  },
  data() {
    return {
      style: {
        animationDelay: 0.25 + .25 * (this.row * this.col) / this.$store.state.maxScore + 's',
        // animationDelay: .15 * (this.row) + 's',
      },
    };
  },
  template: `
    <div class="dot" v-on:click="select" v-bind:style="style">
      <span v-bind:class="{ 'selected': isSelected }"></span>
    </div>
  `,
});

// TODO Refactor h-line and v-line into a single component square-edge
Vue.component('h-line', {
  props: {
    row: {
      type: Number,
      required: true,
    },
    leftCol: {
      type:Number,
      required: true,
    },
    rightCol: {
      type:Number,
      required: true,
    },
  },
  computed: {
    isSelected() {
      return this.$store.getters.isDrawnEdge({
        first: { row: this.row, col: this.leftCol },
        second: { row: this.row, col: this.rightCol },
      });
    },
  },
  template: `
    <div class="h-line" v-bind:class="{ 'selected': isSelected }"><span></span></div>
  `,
});

Vue.component('v-line', {
  props: {
    col: {
      type: Number,
      required: true,
    },
    topRow: {
      type: Number,
      required: true,
    },
    bottomRow: {
      type: Number,
      required: true,
    },
  },
  computed: {
    isSelected() {
      return this.$store.getters.isDrawnEdge({
        first: { row: this.topRow, col: this.col },
        second: { row: this.bottomRow, col: this.col },
      });
    },
  },
  template: `
    <div class="v-line" v-bind:class="{ 'selected': isSelected }"><span></span></div>
  `,
});

Vue.component('cell', {
  props: {
    topRow: {
      type: Number,
      required: true,
    },
    leftCol: {
      type: Number,
      required: true,
    },
  },
  computed: {
    isFilled() {
      const result = this.$store.getters.isFilledCell({
        topRow: this.topRow,
        leftCol: this.leftCol,
      });
      console.info('isFilled', result);
      return result;
    },
    player() {
      let playerId = this.$store.getters.playerAtCell({
        topRow: this.topRow,
        leftCol: this.leftCol,
      });
      return this.$store.getters.playerInitial(playerId);
    },
  },
  template: `
    <div class="cell" v-bind:class="{ 'filled-cell': isFilled }">
      <div v-if="isFilled" class="player">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <text x="16" y="18" text-anchor="middle" alignment-baseline="middle" font-size="32">{{ player }}</text>
        </svg>
      </div>
    </div>
  `,
});

Vue.component('dot-graph', {
  props: {
    cols: {
      type: Number,
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      gameStyle: {
        gridTemplateColumns: `repeat(${this.cols - 1}, 1fr 8fr) 1fr`,
        gridTemplateRows: `repeat(${this.rows - 1}, 1fr 8fr) 1fr`,
      },
    };
  },
  template: `
    <div class="dot-graph" v-bind:style="gameStyle">
      <template v-for="row in rows">
        <!-- Generate horizontal lines and dots -->
        <template v-for="col in cols">
          <dot :col="col" :row="row"></dot>
          <h-line v-if="col < cols" :row="row" :left-col="col" :right-col="col + 1"></h-line>
        </template>

        <!-- Generate vertical lines and cell spaces -->
        <template v-if="row < rows" v-for="col in cols">
          <v-line :top-row="row" :bottom-row="row + 1" :col="col"></v-line>
          <cell v-if="col < cols" :top-row="row" :left-col="col"></cell>
        </template>
      </template>
    </div>
  `,
});



function squareNodeId(row, col) {
  return `r${row}c${col}`;
}

function squareEdgeId(squareNodeA, squareNodeB) {
  let first, second;
  
  if (squareNodeA.col <= squareNodeB.col && squareNodeA.row <= squareNodeB.row) {
    first = squareNodeA;
    second = squareNodeB;
  } else {
    first = squareNodeB;
    second = squareNodeA;
  }

  return `${squareNodeId(first.row, first.col)}-${squareNodeId(second.row, second.col)}`;
}

function squareFaceId(nodes) {
  const separator = ',';
  let id = squareEdgeId(nodes[0], nodes[1]) + separator;
  id += squareEdgeId(nodes[1], nodes[2]) + separator;
  id += squareEdgeId(nodes[2], nodes[3]) + separator;
  id += squareEdgeId(nodes[3], nodes[0]);
  
  return id;
}

function squareGraphEdges(size) {
  const edges = {};

  for (let row = 1; row <= size; row++) {
    for (let col = 1; col <= size; col++) {
      if (col < size) {
        const horizontalEdgeId = squareEdgeId({ row, col }, { row, col: col + 1 });
        edges[horizontalEdgeId] = false;
      }
      
      if (row < size) {
        const verticalEdgeId = squareEdgeId({ row, col }, { row: row + 1, col });
        edges[verticalEdgeId] = false;
      }
    }
  }
  
  console.info('edges', edges);
  
  return edges;
}

function squareGraphFaces(size) {
  let faces = {};
  
  for (let row = 1; row < size; row++) {
    for (let col = 1; col < size; col++) {
      const faceId = squareFaceId([
        { row, col },
        { row, col: col + 1 },
        { row: row + 1, col: col + 1 },
        { row: row + 1, col },
      ]);
      
      faces[faceId] = 0; // No player at face
    }
  }
  
  console.info('faces', faces);
  
  return faces;
}

function adjacentSquareFacesOfEdge(nodeA, nodeB) {
  const faces = [];

  if (nodeA.row === nodeB.row) {
    // Horizontal edge
    let topRow = nodeA.row - 1;
    let leftCol = Math.min(nodeA.col, nodeB.col);
    
    // Face above edge
    if (topRow > 0) {
      faces.push([
        { row: topRow, col: leftCol },
        { row: topRow, col: leftCol + 1 },
        { row: topRow + 1, col: leftCol + 1},
        { row: topRow + 1, col: leftCol},
      ]);
    }
    // Face below edge
    // TODO Refactor so DOT_COUNT is not required
    if (topRow <= DOT_COUNT) {
      faces.push([
        { row: topRow + 1, col: leftCol },
        { row: topRow + 1, col: leftCol + 1 },
        { row: topRow + 2, col: leftCol + 1 },
        { row: topRow + 2, col: leftCol },
      ]);
    }
  } else {
    // Vertical edge
    let topRow = Math.min(nodeA.row, nodeB.row);
    let leftCol = nodeA.col - 1;
    
    // Face left of edge
    if (leftCol > 0) {
      faces.push([
        { row: topRow, col: leftCol },
        { row: topRow, col: leftCol + 1 },
        { row: topRow + 1, col: leftCol + 1 },
        { row: topRow + 1, col: leftCol },
      ]);
    }
    
    // Face right of edge
    // TODO Refactor so DOT_COUNT is not required
    if (leftCol <= DOT_COUNT) {
      faces.push([
        { row: topRow, col: leftCol + 1 },
        { row: topRow, col: leftCol + 2 },
        { row: topRow + 1, col: leftCol + 2 },
        { row: topRow + 1, col: leftCol + 1 },
      ]);
    }
  }

  return faces;
}


// TODO Change naming to nodeA and nodeB
function isAdjacent(first, second) {
  return (first.row === second.row && (first.col === second.col - 1 || first.col === second.col + 1))
  || (first.col === second.col && (first.row === second.row - 1 || first.row === second.row + 1));
}

const store = new Vuex.Store({
  state: {
    firstDot: null,
    edges: squareGraphEdges(DOT_COUNT),
    faces: squareGraphFaces(DOT_COUNT),
    currentPlayer: 1,
    maxScore: Math.pow(DOT_COUNT - 1, 2),
    scores: { 1: 0, 2: 0 },
    playerNames: { 1: 'Yoshi', 2: 'Mario' },
    mute: true,
  },
  getters: {
    isSelectedDot(state) {
      return (({ row, col }) => (
        state.firstDot
        && state.firstDot.row === row
        && state.firstDot.col === col
      ));
    },
    isDrawnEdge(state) {
      return (({ first, second }) => state.edges[squareEdgeId(first, second)]);
    },
    isFilledCell(state, getters) {
      return (({ topRow, leftCol }) => {
        return getters.playerAtCell({ topRow, leftCol }) > 0;
      });
    },
    playerAtCell(state) {
      return (({ topRow, leftCol }) => {
        const nodes = [
          { row: topRow, col: leftCol },
          { row: topRow, col: leftCol + 1 },
          { row: topRow + 1, col: leftCol + 1 },
          { row: topRow + 1, col: leftCol },
        ];
        return state.faces[squareFaceId(nodes)];
      });
    },
    playerName(state) {
      return playerId => state.playerNames[playerId];
    },
    playerInitial(state) {
      return playerId => state.playerNames[playerId].substr(0, 1);
    },
    winner(state) {
      // console.info('winner getter');
      // console.info(state.maxScore);
      // console.info(state.scores[1]);
      // console.info(state.scores[2]);
      if (state.scores[1] + state.scores[2] === state.maxScore) {
        if (state.scores[1] > state.scores[2]) {
          return 1;
        } else if (state.scores[1] < state.scores[2]) {
          return 2;
        } else {
          return 0;
        }
      } else {
        return null;
      }
    },
  },
  actions: {
    actOnDot({commit, state, getters}, dot) {
      if (state.firstDot) {
        const firstDot = state.firstDot;
        const secondDot = dot;
        if (firstDot.row === secondDot.row && firstDot.col === secondDot.col) {
          commit('resetFirstDot');
        } else if (isAdjacent(firstDot, secondDot)
          && !getters.isDrawnEdge({ first: firstDot, second: secondDot })
        ) {
          let hasFilledNewCell = false;
          
          commit('selectEdge', { firstDot, secondDot });
          adjacentSquareFacesOfEdge(firstDot, secondDot).forEach(nodes => {
            if (
              getters.isDrawnEdge({ first: nodes[0], second: nodes[1] })
              && getters.isDrawnEdge({ first: nodes[1], second: nodes[2] })
              && getters.isDrawnEdge({ first: nodes[2], second: nodes[3] })
              && getters.isDrawnEdge({ first: nodes[3], second: nodes[0] })
            ) {
              hasFilledNewCell = true;
              commit('selectFace', nodes);
              commit('incrementPlayerScore', state.currentPlayer);
              // if (state.scores[1] + state.scores[2] === state.faces.length) {
              //   commit('setWinner', state.scores[1] > state.scores[2] ? 1 : 2);
              // }
            }
          });
          commit('resetFirstDot');
          if (!hasFilledNewCell) {
            commit('toggleCurrentPlayer');
          }
        } else {
          commit('resetFirstDot');
          commit('setFirstDot', secondDot);
        }
      } else {
        commit('setFirstDot', dot);
      }
    },
  },
  mutations: {
    setFirstDot(state, { row, col }) {
      AUDIO.tap.play();
      state.firstDot = { row, col };
    },
    resetFirstDot(state) {
      AUDIO.tap.play();
      state.firstDot = null;
    },
    selectEdge(state, { firstDot, secondDot }) {
      AUDIO.tap.play();
      Vue.set(state.edges, squareEdgeId(firstDot, secondDot), true);
    },
    selectFace(state, nodes) {
      // AUDIO.collect.play();
      Vue.set(state.faces, squareFaceId(nodes), state.currentPlayer);
    },
    incrementPlayerScore(state, player) {
      console.info(state.scores[player]);
      Vue.set(state.scores, player, state.scores[player] + 1);
      console.info(state.scores[player]);
    },
    toggleCurrentPlayer(state) {
      if (state.currentPlayer === 1) {
        state.currentPlayer = 2;
      } else {
        state.currentPlayer = 1;
      }
    },
    // setWinner(state, player) {
    //   state.winner = player;
    // },
  },
});

new Vue({
  el: '#app',
  store,
  data() {
    return {
      dotCount: DOT_COUNT,
    };
  },
});

let AUDIO = {
  collect: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/928004/collect.ogg'),
  tap: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/928004/tap-1.ogg'),
};

