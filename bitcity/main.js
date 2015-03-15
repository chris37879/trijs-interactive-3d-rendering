document.addEventListener("DOMContentLoaded", function(){
    var container = document.getElementById('scene-container');

    //Setup the Scene
    var scene = new BitCity.Scene(container);

    scene.upscaleFactor = 1;

    //Initialize the Scene.
    scene.init();

    //Call render once to begin.
    scene.render();

    window.addEventListener('resize', function(){
        scene.resize();
    });
});
