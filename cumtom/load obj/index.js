(function() {
  const canvas = document.getElementById("canvas"),
    gl = canvas.getContext("webgl");

  function clear(){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  function init() {
    clear();
  }

  init();
})()
