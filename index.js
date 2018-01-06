// TODO
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
      const selected = this.$store.state.selected;
      return (selected !== null
        && selected.row === this.row
        && selected.col === this.col);
    },
  },
  methods: {
    select: function(event) {
      this.$store.commit({
        type: 'select',
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

Vue.component('h-line', {
  props: {
    row: {
      type: Number,
      isRequired: true,
    },
    col: {
      type: Number,
      isRequired: true,
    },
  },
  computed: {
    isSelected() {
      return this.$store.state.hLines[this.col][this.row];
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
    row: {
      type: Number,
      isRequired: true,
    },
  },
  computed: {
    isSelected() {
      // return false;
      // console.info(this.col, this.row);
      return this.$store.state.vLines[this.col][this.row];
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
      <h-line v-if="col < cols" :row="row - 1" :col="col - 1"></h-line>
    </template>

    <!-- Generate vertical lines and cell spaces -->
    <template v-if="row < rows" v-for="col in cols">
      <v-line :row="row - 1" :col="col - 1"></v-line>
      <cell-space v-if="col < cols"></cell-space>
    </template>
  </template>
</div>`,
});

const DOT_COUNT = 4;
const store = new Vuex.Store({
  state: {
    selected: null,
    hLines: Array(DOT_COUNT).fill().map(() => Array(DOT_COUNT - 1).fill(false)),
    vLines: Array(DOT_COUNT).fill().map(() => Array(DOT_COUNT - 1).fill(false)),
  },
  mutations: {
    select(state, payload) {
      function isAdjacent(first, second) {
        return (first.row === second.row && (first.col === second.col - 1 || first.col === second.col + 1))
          || (first.col === second.col && (first.row === second.row - 1 || first.row === second.row + 1));
      }
      
      if (state.selected !== null) {
        const first = state.selected;
        const second = payload;
        if (first.row === second.row && first.col === second.col) {
          // Selected same dot, so undo that choice
          state.selected = null;
        } else if (isAdjacent(first, second)) {
          // Selected an adjacent dot, so draw a line and reset dot selection
          state.selected = null;
          if (first.row === second.row) {
            // Dealing with h-line
            let leftCol = first.col < second.col ? first.col : second.col;
            state.hLines[leftCol - 1][first.row - 1] = true;
            // TODO Consider better approach for triggering Vue reaction
            state.hLines = state.hLines.slice(0, state.hLines.length);
          } else {
            let topRow = first.row < second.row ? first.row : second.row;
            state.vLines[first.col - 1][topRow - 1] = true;
            // TODO Consider better approach for triggering Vue reaction
            state.vLines = state.vLines.slice(0, state.vLines.length);
          }
        } else {
          // Selected a non-adjacent dot, change selection to new dot
          state.selected = {
            row: payload.row,
            col: payload.col,
          };
        }
      } else {
        state.selected = {
          row: payload.row,
          col: payload.col,
        };
      }
    }
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


