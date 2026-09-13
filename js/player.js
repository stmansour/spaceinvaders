class Player {
    constructor(c, n) {
        n = (typeof n === 'undefined') ? 1 : n;
        this.name = "<" + n + ">";
        this.score = 0;
        this.credits = c;
        this.lives = 0;
        this.wavesCompleted = 0;
        this.gamesWon = 0;
        this.waveTop = 100;  // gets bigger every time the player wins a wave
        this.bombDropOdds = 4000;
        this.invaders = null;
        this.bonusAwarded = false;
        this.bonusLifeTime = 0;
        this.bonusLifeSlot = -1;
    }

    newGame() {
        this.score = 0;
        this.lives = 3;
        this.wavesCompleted = 0;
        this.waveTop = 100;
        this.bombDropOdds = 4000;
        this.invaders = null;
        this.bonusAwarded = false;
        this.bonusLifeTime = 0;
        this.bonusLifeSlot = -1;
    }
}
