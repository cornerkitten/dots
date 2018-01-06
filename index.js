document.addEventListener('touchstart', () => {}, true);

Vue.component('dot', {
  methods: {
    select: function(event) {
      // TODO Move class name to data/constant
      this.$el.querySelector('span').classList.toggle('selected');
    },
  },
  template: `
<div class="dot" v-on:click="select"><span></span></div>
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
      <dot></dot>
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

new Vue({
  el: '#app',
  data() {
    return {
      dotCount: 2,
    };
  },
});

