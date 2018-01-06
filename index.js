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
  // data() {
  //   return {
  //     isSelected: false,
  //   };
  // },
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
      // TODO Move class name to data/constant
      // console.info(`col: ${this.col}, row: ${this.row}`);
      // console.info(this.$store.commit('increment'));
      // console.info(this.$store.state.count);
      
      this.$store.commit({
        type: 'select',
        row: this.row,
        col: this.col,
      });
      console.info(this.$store.state);
     
      // this.isSelected = !this.isSelected;
    },
  },
  template: `
<div class="dot" v-on:click="select">
  <span v-bind:class="{ 'selected': isSelected }"></span>
</div>
`,
});

Vue.component('h-line', {
  template: `
<div class="h-line"><span></span></div>
`,
});

Vue.component('v-line', {
  template: `
<div class="v-line"><span></span></div>
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
      <h-line v-if="col < cols"></h-line>
    </template>

    <!-- Generate vertical lines and cell spaces -->
    <template v-if="row < rows" v-for="col in cols">
      <v-line></v-line>
      <cell-space v-if="col < cols"></cell-space>
    </template>
  </template>
</div>`,
});

const store = new Vuex.Store({
  state: {
    selected: null,
  },
  mutations: {
    select(state, payload) {
      if (state.selected !== null
        && state.selected.row === payload.row
        && state.selected.col === payload.col
      ) {
        state.selected = null;
      } else if (state.selected === null) {
        state.selected = {
          row: payload.row,
          col: payload.col,
        };
      }
    },
  },
});

new Vue({
  el: '#app',
  store,
  data() {
    return {
      dotCount: 2,
    };
  },
});


