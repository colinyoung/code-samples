TICK_TIME = 50;
DAMAGE_DELAY_TIME = 600;

var Proton = function(options) {
  this.options = options;
  this.bob = this.options.bob; // `Bob` is the character class.
  this.collisionGroup = options.collisionGroup;
  if (options.position) {
    this.position = options.position;
  } else {
    // Start from machine's position unless options.position is given
    this.position = options.machine.getPosition();
  }
  this.moveSpeed = 10; // px/s
  this.movementAngle = options.movementAngle; // 0-359
  this.animationSpeed = 0.15; // seconds
  this.config = {
    animationFrames: 3
  }

  _.extend(this, SpriteMethods);

  this.addToLayer = function(layer) {

    var winSize = cc.director.getWinSizeInPixels();
    var screenWidth = winSize.width;
        screenHeight = winSize.height;

    this.sprite = cc.Sprite.create(res.Proton_single_png);
    if (this.sprite && this.sprite.retain) this.sprite.retain();
    this.sprite.tag = 456;

    this.sprite.attr({
      x: this.position.x,
      y: this.position.y,
      scale: 0.25
    });

    this.sprite.onEnterTransitionDidFinish = function () {
      this.numTicks = 0;
      this.animate();
      this.startMoving();
    }.bind(this)

    this.sprite.onExit = function () {
      if (this.movementInterval) {
        this.stopMoving();
      }
      console.log('proton die');
      delete this.numTicks;
      if (this.sprite && this.sprite.release) this.sprite.release();
    }

    layer.addChild(this.sprite, 0);
  }

  this.animate = function() {
    // TAG: IOS HACKS
    if (Config.isMobile()) return;
    // Add standing animation (single frame)
    var animFrames = [];
    for (var i = 1; i < this.config.animationFrames + 1; i++) {
      var filename = "Proton" + i + ".png";
      var spriteFrame = cc.spriteFrameCache.getSpriteFrame(filename);

      var animFrame = new cc.AnimationFrame();
      animFrame.initWithSpriteFrame(spriteFrame, 1, null);
      animFrames.push(animFrame);
    }

    var animation = cc.Animation.create(animFrames, this.animationSpeed);
    var animate = cc.Animate.create(animation);
    var forever = cc.RepeatForever.create(animate);
    this.sprite.runAction(forever);
  }

  this.startMoving = function() {
    this.canDamageBob = false;
    clearInterval(this.movementInterval); // just in case
    this.movementInterval = setInterval(this.movementTick.bind(this), TICK_TIME);

    // Don't allow them to damage bob immediately, wait a bit while they spread out
    setTimeout(function() {
      this.canDamageBob = true;
    }.bind(this), DAMAGE_DELAY_TIME);
  }

  this.stopMoving = function() {
    this.sprite.pause();
    clearInterval(this.movementInterval);
    delete this.movementInterval;
  }

  this.movementTick = function() {
    // - move proton
    this.move();

    // - detect collision with bob
    if (this.canDamageBob && this.sprite && this.sprite.parent) {
      var spriteBounds = Rect.bounds(this.sprite.getBoundingBox());
      if (Rect.intersection(this.getBounds(), this.bob.getBounds()) !== undefined) {
        this.options.characterWasHit(this);
      }
    }

    // - detect collision with wall and bounce, computing new angle
    var collisionGroup = this.collisionGroup;
    var collisionGroupBounds = _.map(collisionGroup.getObjects(), function(group) {
      return Rect.bounds(group);
    });

    for (var i = collisionGroupBounds.length - 1; i >= 0; i--) {
      var boundRect = collisionGroupBounds[i];
      var intersection = Rect.intersection(this.getBounds(), boundRect);
      if (intersection !== undefined) {
        if (this.numTicks < 5) return;
        this.intersection = intersection;
        this.movementAngle = this.normalizeAngle(this.movementAngle + 90);
      }
    }
    this.numTicks += 1;
  }

  this.move = function () {
    if (!this.sprite) return;
    var pos = this.sprite.getPosition();
    var dx = Math.cos(this.movementAngle * Math.PI / 180) * this.moveSpeed,
        dy = Math.sin(this.movementAngle * Math.PI / 180) * this.moveSpeed;

    this.sprite.setPosition({x: pos.x + dx, y: pos.y + dy});
  }

  this.normalizeAngle = function(angle) {
    if (angle >= 360) {
      return angle - 360;
    }
    if (angle < 0) {
      return 360 + angle;
    }
    return angle;
  }
}


Proton.dieTime = function() {
  var dieTimeSecs = Math.max(Math.floor(Math.random() * 10), 3);
  return dieTimeSecs * 1000 * 5;
}
