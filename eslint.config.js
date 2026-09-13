export default [
  {
    ignores: [
      "dist/**"
    ]
  },
  {
    files: ["js/**/*.js", "candidates/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        AudioContext: "readonly",
        webkitAudioContext: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        Math: "readonly",
        ImageData: "readonly",
        Request: "readonly",
        fetch: "readonly",
        // P5.js Globals
        p5: "readonly",
        createCanvas: "readonly",
        loadImage: "readonly",
        loadFont: "readonly",
        millis: "readonly",
        floor: "readonly",
        frameRate: "readonly",
        image: "readonly",
        background: "readonly",
        fill: "readonly",
        noFill: "readonly",
        rect: "readonly",
        text: "readonly",
        textFont: "readonly",
        textSize: "readonly",
        textAlign: "readonly",
        keyIsDown: "readonly",
        noSmooth: "readonly",
        stroke: "readonly",
        noStroke: "readonly",
        push: "readonly",
        pop: "readonly",
        scale: "readonly",
        translate: "readonly",
        rotate: "readonly",
        width: "readonly",
        height: "readonly",
        windowWidth: "readonly",
        windowHeight: "readonly",
        key: "readonly",
        keyCode: "readonly",
        LEFT_ARROW: "readonly",
        RIGHT_ARROW: "readonly",
        UP_ARROW: "readonly",
        DOWN_ARROW: "readonly",
        CENTER: "readonly",
        LEFT: "readonly",
        RIGHT: "readonly"
      }
    },
    rules: {
      "no-dupe-keys": "error",
      "no-dupe-class-members": "error",
      "no-func-assign": "error",
      "no-unreachable": "error",
      "no-unused-vars": [
        "warn",
        {
          "varsIgnorePattern": "^[A-Z]|^(preload|setup|draw|keyPressed|keyReleased|mousePressed|windowResized|onePlayer|twoPlayers|coinInserted|setInnerHTML|zeroFillNumber)",
          "argsIgnorePattern": "^_",
          "caughtErrors": "none"
        }
      ]
    }
  }
];
