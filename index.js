document.addEventListener('touchstart', () => {}, true);

Vue.component('dot', {
  template: `
<div class="dot"><span></span></div>
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
        gridTemplateColumns: `repeat(${this.cols}, 1fr 8fr) 1fr`,
        gridTemplateRows: `repeat(${this.rows}, 1fr 8fr) 1fr`,
      },
    };
  },
  template: `
<div class="dot-game" v-bind:style="gameStyle">
  <template v-for="row in rows">
    <!-- Generate dots and horizontal lines above row -->
    <template v-for="col in cols">
      <dot></dot>
      <h-line></h-line>
    </template>
    <dot></dot>

    <!-- Generate vertical lines and cell spacing in row -->
    <template v-for="col in cols">
      <v-line></v-line>
      <cell-space></cell-space>
    </template>
    <v-line></v-line>
  </template>

  <!-- Generate bottom dots and horizontal lines below final row -->
  <template v-for="col in cols">
    <dot></dot>
    <h-line></h-line>
  </template>
  <dot></dot>
</div>`,
});

new Vue({
  el: '#app',
  data() {
    return {
      cellCount: 4,
    };
  },
});

