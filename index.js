(function() {
  function setup() {
    let lines = document.querySelectorAll('.h-line, .v-line');
    lines.forEach(setupLine);
  }
  
  function setupLine(line) {
    line.addEventListener('click', onClickLine);
  }
  
  function onClickLine() {
    this.classList.toggle('solid-line');
    console.info(this.className);
  }
  
  window.onload = setup();
})();