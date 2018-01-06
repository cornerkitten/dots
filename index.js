// TODO
//  - Add cell capturing (consider having something collected from the center)
//  - Fix required vs isRequired on component props
// DONE
//  - Refactor state logic
//  - Refresh h-line component when state changes for $store.state.hLines
document.addEventListener('touchstart', () => {}, true);

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
      //const selected = this.$store.state.selected;
      // return (selected !== null
      //   && selected.row === this.row
      //   && selected.col === this.col);
    },
  },
  methods: {
    select: function(event) {
      this.$store.dispatch({
        type: 'actOnDot',
        row: this.row,
        col: this.col,
      });
      // console.info(this.$store.state);
    },
  },
  template: `
<div class="dot" v-on:click="select">
  <span v-bind:class="{ 'selected': isSelected }"></span>
</div>
`,
});

// TODO Refactor h-line and v-line into a single component square-edge
Vue.component('h-line', {
  props: {
    row: {
      type: Number,
      isRequired: true,
    },
    leftCol: {
      type:Number,
      isRequired: true,
    },
    rightCol: {
      type:Number,
      isRequired: true,
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
      isRequired: true,
    },
    topRow: {
      type: Number,
      isRequired: true,
    },
    bottomRow: {
      type: Number,
      isRequired: true,
    },
  },
  computed: {
    isSelected() {
      return this.$store.getters.isDrawnEdge({
        first: { row: this.topRow, col: this.col },
        second: { row: this.bottomRow, col: this.col },
      });
      
      // return false;
      // console.info(this.col, this.row);
      // return this.$store.state.vLines[this.col][this.row];
    },
  },
  template: `
<div class="v-line" v-bind:class="{ 'selected': isSelected }"><span></span></div>
`,
});

Vue.component('cell-space', {
  template: `
<div class="space"><span></span></div>
`,
});

Vue.component('dot-game', {
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
<div class="dot-game" v-bind:style="gameStyle">
  <template v-for="row in rows">
    <!-- Generate horizontal lines and dots -->
    <template v-for="col in cols">
      <dot :col="col" :row="row"></dot>
      <h-line v-if="col < cols" :row="row" :left-col="col" :right-col="col + 1">
      </h-line>
    </template>

    <!-- Generate vertical lines and cell spaces -->
    <template v-if="row < rows" v-for="col in cols">
      <v-line :top-row="row" :bottom-row="row + 1" :col="col"></v-line>
      <cell-space v-if="col < cols"></cell-space>
    </template>
  </template>
</div>`,
});



const DOT_COUNT = 4;

// class LineGrid {
//   constructor(dotCount) {
//     this.dotCount = dotCount;
//     this.hLines = Array(dotCount).fill().map(() => Array(dotCount - 1).fill(false));
//     this.vLines = Array(dotCount).fill().map(() => Array(dotCount - 1).fill(false));
//   }
// }

// class Graph {

// }

// {
//   nodes: [
//     'r1c1': 0,
//     1,
//     2,
//     ...
//   ],
//   edges: {
//     {
//       '0-1': false,
//       '2-3': false,
//     }
//   }
// }

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

function squareGraph(size) {
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
  
  console.info(edges);
  
  return edges;
}

// TODO Change naming to nodeA and nodeB
function isAdjacent(first, second) {
  return (first.row === second.row && (first.col === second.col - 1 || first.col === second.col + 1))
  || (first.col === second.col && (first.row === second.row - 1 || first.row === second.row + 1));
}

const store = new Vuex.Store({
  state: {
    // selected: null,
    // hLines: Array(DOT_COUNT).fill().map(() => Array(DOT_COUNT - 1).fill(false)),
    // vLines: Array(DOT_COUNT).fill().map(() => Array(DOT_COUNT - 1).fill(false)),
    edges: squareGraph(DOT_COUNT),
    firstDot: null,
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
    }
  },
  actions: {
    actOnDot({commit, state}, dot) {
      //commit('select', dot);
      //return;
      
      if (state.firstDot) {
        const firstDot = state.firstDot;
        const secondDot = dot;
        if (firstDot.row === secondDot.row && firstDot.col === secondDot.col) {
          commit('resetFirstDot');
        } else if (isAdjacent(firstDot, secondDot)) {
          commit('selectEdge', { firstDot, secondDot });
          commit('resetFirstDot');
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
      // console.info('setFirstDot', row, col);
      state.firstDot = { row, col };
    },
    resetFirstDot(state) {
      state.firstDot = null;
    },
    selectEdge(state, { firstDot, secondDot }) {
      Vue.set(state.edges, squareEdgeId(firstDot, secondDot), true);
    },
    // select(state, payload) {
    //   if (state.selected !== null) {
    //     const first = state.selected;
    //     const second = payload;
    //     if (first.row === second.row && first.col === second.col) {
    //       // Selected same dot, so undo that choice
    //       state.selected = null;
    //     } else if (isAdjacent(first, second)) {
    //       // Selected an adjacent dot, so draw a line and reset dot selection
    //       state.selected = null;
    //       if (first.row === second.row) {
    //         // Dealing with h-line
    //         let leftCol = first.col < second.col ? first.col : second.col;
    //         state.hLines[leftCol - 1][first.row - 1] = true;
    //         // TODO Consider better approach for triggering Vue reaction
    //         state.hLines = state.hLines.slice(0, state.hLines.length);
    //       } else {
    //         let topRow = first.row < second.row ? first.row : second.row;
    //         state.vLines[first.col - 1][topRow - 1] = true;
    //         // TODO Consider better approach for triggering Vue reaction
    //         state.vLines = state.vLines.slice(0, state.vLines.length);
    //       }
    //     } else {
    //       // Selected a non-adjacent dot, change selection to new dot
    //       state.selected = {
    //         row: payload.row,
    //         col: payload.col,
    //       };
    //     }
    //   } else {
    //     state.selected = {
    //       row: payload.row,
    //       col: payload.col,
    //     };
    //   }
    // }
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


