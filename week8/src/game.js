export default function game() {
    let player;
    let bullet = [];
    let texture;
    let state;
    let bulletTimer = 0;
    let useBullet = 0;
    
    const atuoShootFrame = 12;
    const screenWidth = 1024;
    const screenHeight = 768;
    const bulletVy = 10;
    const maxBullet = 10;
    const play = "play", pause = "pause", dead = "dead", stop = "stop";

    let left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40),
        space = keyboard(32);

    //Aliases 設定別名
    let Application = PIXI.Application,
        loader = PIXI.loader,
        Sprite = PIXI.Sprite,
        TextureCache = PIXI.utils.TextureCache

    // Create a Pixi Application 
    let app = new Application({
        width: screenWidth,         // default: 1024
        height: screenHeight,        // default: 768
        antialias: true,    // default: false
        transparent: false, // default: false
        resolution: 1,       // default: 1
        //backgroundColor: 0x061639
    });

    // Add the canvas that Pixi automatically created for you to the HTML document 
    document.body.appendChild(app.view);

    // load an image and run the `loadImage` function when it's done
    loader
        //BallImage為別名
        //.add("BallImage", "images/PokemonBall.png")
        .add([
            "images/npc.json",
        ])
        .load(initial);

    function creatPlayer(imageName) {
        let texture = TextureCache[imageName];
        player = new Sprite(texture);
        player.vx = 0;
        player.vy = 0;
        app.stage.addChild(player);
        player.position.set((screenWidth - player.width) / 2, screenHeight - 100);
    }

    function creatBullet(imageName) {
        texture = TextureCache[imageName];
        for (let i = 0; i < maxBullet; i++) {
            bullet[i] = new Sprite(texture);
            bullet[i].visible = false;
            bullet[i].vx = 0;
            bullet[i].vy = 0;
            bullet[i].position.set(-100, -100);
            app.stage.addChild(bullet[i]);
        }
    }

    function initial() {
        creatPlayer("player.png");
        creatBullet("bullet.png");
        setKeyboard();
        TweenMax.to(player, 5, { x: 900, y: 100 });

        //Set Timer
        app.ticker.add(delta => update(delta));
        state = play;
    }

    function update() {
        if (state != pause && state != stop) {
            movePlayer();
            bulletShooting();
        }
    }

    function setKeyboard() {
        //空白建射擊
        let keySpace = keyboard(32);
        //Ctrl 或 P 暫停
        let keyCtrl = keyboard(17);
        let keyP = keyboard(80);
        //Enter重新開始
        let keyEnter = keyboard(13);

        keySpace.press = () => {
            if (state === play) {
                bulletTimer = 0;
                bulletShoot();
            }
        };

        keyCtrl.press = () => {
            if (state === play) state = pause;
            else if (state === pause) state = play;
        };

        keyP.press = () => {
            if (state === play) state = pause;
            else if (state === pause) state = play;
        };

        keyEnter.press = () => {
            replayGame();
        };
    }

    function bulletShoot() {
        bullet[useBullet].visible = true;
        bullet[useBullet].x = player.x + (player.width - bullet[useBullet].width) / 2;
        bullet[useBullet].y = player.y - 18;
        bullet[useBullet].vx = player.vx;
        bullet[useBullet].vy = -1 * bulletVy;
        useBullet++;
        if (useBullet >= maxBullet) useBullet = 0;
    }

    function movePlayer() {
        if (state === dead) return;
        //按方向鍵加速
        if (left.isDown === true && player.vx > -6) {
            player.vx += -0.3;
        }
        if (up.isDown === true && player.vy > -6) {
            player.vy += -0.3;
        }
        if (right.isDown === true && player.vx < 6) {
            player.vx += 0.3;
        }
        if (down.isDown === true && player.vy < 6) {
            player.vy += 0.3;
        }

        //自動減速
        if (player.vy > 0) {
            player.vy -= 0.1;
            if (player.vy < 0) player.vy = 0;
        }
        if (player.vx > 0) {
            player.vx -= 0.1;
            if (player.vx < 0) player.vx = 0;
        }
        if (player.vy < 0) {
            player.vy += 0.1;
            if (player.vy > 0) player.vy = 0;
        }
        if (player.vx < 0) {
            player.vx += 0.1;
            if (player.vx > 0) player.vx = 0;
        }
        player.x += player.vx;
        player.y += player.vy;

        //撞牆停止
        if (player.x < 0) {
            player.x = 0;
            player.vx = 0;
        }
        if (player.x > screenWidth - player.width) {
            player.x = screenWidth - player.width;
            player.vx = 0;
        }
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }
        if (player.y > screenHeight - player.height) {
            player.y = screenHeight - player.height;
            player.vy = 0;
        }

        //自動射擊
        if (space.isDown === true) {
            bulletTimer++;
            if (bulletTimer > atuoShootFrame) {
                bulletShoot();
                bulletTimer = 0;
            }
        }
    }

    function bulletShooting() {
        for (let i = 0; i < maxBullet; i++) {
            if (bullet[i].visible === false) continue;
            bullet[i].x += bullet[i].vx;
            bullet[i].y += bullet[i].vy;
            if (bullet[i].y < -1 * bullet[i].height) bullet[i].visible = false;
        }
    }

    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
